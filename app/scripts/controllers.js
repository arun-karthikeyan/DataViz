'use strict';

angular.module('datavizApp')

.controller('IndexController', ['$scope', function($scope) {
  //Index controller code goes here
}])

.controller('CO2Controller', ['$scope', function($scope) {
  //CO2 controller code goes here
  function vis1Init(){
    // Various accessors that specify the four dimensions of data to visualize.
        function x(d) {
            return d.Population;
        }

        function y(d) {
            return d.GDP;
        }

        function radius(d) {
            return d.CO2;
        }

        function color(d) {
            return d.region;
        }

        function key(d) {
            return d.name;
        }

    // Chart dimensions.
        var margin = {top: 35, right: 41.5, bottom: 25.5, left: 89.5},
            width = 960 - margin.right,
            height = 500 - margin.top - margin.bottom;

    // Various scales. These domains make assumptions of data, naturally.
        var xScale = d3.scaleSqrt().domain([4000, 1.5e7, 0.75e8, 2E9]).range([0, 0.4 * width, 0.8 * width, width]),
            yScale = d3.scaleSqrt().domain([0, 1.1e11, 2.1e12, 8.0e13]).range([height, 0.5 * height, 0.1 * height, 0]),
            radiusScale = d3.scaleSqrt().domain([0, 1.5e4, 5.1e6, 10.5e6]).range([0, 15, 35, 40]),
            colorScale = d3.scaleOrdinal(d3.schemeCategory10);


        var xAxisValues = [4000, 15000000, 75000000, 2000000000],
            xAxisTicks = [0.1, 0.4, 0.8, 1];

        var yAxisValues = [0, 110000000000, 2100000000000, 80000000000000],
            yAxisTicks = [0, 0.1, 0.5, 1];

    // The x & y axes.
        var xAxis = d3.axisBottom(xScale).ticks(xAxisTicks).tickValues(xAxisValues).tickFormat(d3.format(",.0f")),
            yAxis = d3.axisLeft(yScale).ticks(yAxisTicks).tickValues(yAxisValues).tickFormat(function (d) {
                return (d / 1000000);
            });


    // Load the data.
        d3.json("Data/CO2_nations_data.json", function (country) {

            // Create the SVG container and set the origin.
            var svg = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .style("background", "#000000")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            d3.select("#chart svg").attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .call(d3.zoom().scaleExtent([1, 40])
                    .translateExtent([[-margin.right, -margin.bottom - margin.top], [width, height + margin.bottom]]).on("zoom", function () {
                        svg.attr("transform", d3.event.transform)
                    }))
                .append("g");

            // Add the x-axis.
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll('.tick text')
                .style("fill", "#fff");

            // Add the y-axis.
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .selectAll('.tick text')
                .style("fill", "#fff");

            // Add an x-axis label.
            svg.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height - 10)
                .text("Total Population ");

            // Add a y-axis label.
            svg.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("y", 10)
                .attr("dy", ".75em")
                .attr("transform", "rotate(-90)")
                .text("Gross Domestic Product (in $ million)");

            // Add the year label; the value is set on transition.
            var label = svg.append("text")
                .attr("class", "year label")
                .attr("text-anchor", "end")
                .attr("y", height - 24)
                .attr("x", width)
                .text(1960);

            // Add a bubble per nation. Initialize the data at 1960, and set the colors.
            var bubble = svg.append("g")
                .attr("class", "dots")
                .selectAll(".bubble")
                .data(interpolateData(1960))
                .enter().append("circle")
                .attr("class", "bubble")
                .style("fill", function (d) {
                    return colorScale(color(d));
                })
                .call(position);

            bubble.data(interpolateData(2013)).append("title")
                .text(function (d) {
                    return ("Country Name - " + d.name + "\n" + "Population - " + (d.Population) + "\n" + "GDP(in $ million) - " + (d.GDP) + "\n" + "CO2 Emission(kT) - " + (d.CO2))
                });

            // Start a transition that interpolates the data based on year.
            /*svg.transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .tween("year", tweenYear);*/

            // Positions the dots based on data.
            function position(bubble) {
                bubble.attr("cx", function (d) {
                    return xScale(x(d));
                })
                    .attr("cy", function (d) {
                        return yScale(y(d));
                    })
                    .attr("r", function (d) {
                        return radiusScale(radius(d));
                    });
            }

            // For the interpolated data, the dots and label are redrawn.
            function tweenYear() {
                var year = d3.interpolateNumber(1960, 2013);
                return function (t) {
                    displayYear(year(t));
                };
            }



            // Updates the display to show the specified year.
            function displayYear(year) {
                bubble.data(interpolateData(year), key).call(position);
                label.text(Math.round(year));
            }

            // Interpolates the dataset for the given (fractional) year.
            function interpolateData(year) {

                return country.map(function (d) {
                    return {
                        name: d.name,
                        region: d.region,
                        Population: interpolateValues(d.Population, year),
                        CO2: interpolateValues(d.CO2, year),
                        GDP: interpolateValues(d.GDP, year)
                    };
                });

            }

            // Finds (and possibly interpolates) the value for the specified year.
            function interpolateValues(values, year) {
                var i = d3.bisector(function (d) {
                        return d[0];
                    }).left(values, year, 0, values.length - 1),
                    a = values[i];
                if (i > 0) {
                    var b = values[i - 1],
                        t = (year - a[0]) / (b[0] - a[0]);
                    return a[1] * (1 - t) + b[1] * t;
                }
                //console.log(a[1], year);
                return a[1];
            }

            //Play the animation when user clicks play button
            $("#play").on("click",function (){
                function tweenYear1() {
                    var year1 = d3.interpolateNumber(($("#slider").val()), 2013);
                    return function (t) {
                        displayYear(year1(t));
                        //console.log(year1);
                        $("#slider").val(year1(t));
                        bubble.data(2013).append("title")
                            .text(function (d) {
                                return ("Country Name - " + d.name + "\n" + "Population - " + (d.Population) + "\n" + "GDP(in $ million) - " + (d.GDP) + "\n" + "CO2 Emission(kT) - " + (d.CO2))
                            });
                        if(year1(t)==2013){
                            $("#slider").val(1960);
                        }
                    };
                }
                if (($("#slider").val())!=2013){
                    svg.transition()
                        .duration(function () {
                            return ((2013 - ($("#slider").val()))*(10000/53))
                        })
                        .ease(d3.easeLinear)
                        .tween("year", tweenYear1);
                }
                //console.log($("#slider").val());
            });

            //Display data according to selected year in Year slider
            $("#slider").on("change", function(){
                //console.log($("#slider").val());
                bubble.data(interpolateData($("#slider").val()), key).call(position);
                bubble.select("title").remove();
                bubble.append("title")
                    .text(function (d) {
                        return ("Country Name - " + d.name + "\n" + "Population - " + (d.Population) + "\n" + "GDP(in $ million) - " + (d.GDP) + "\n" + "CO2 Emission(kT) - " + (d.CO2))

                    });
                label.text(Math.round($("#slider").val()));
            });
        });
  } // end of vis1

  function vis2Init(){

    //Creating the attributes
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1060 - margin.left - (margin.right),
    height = 500 - margin.top - margin.bottom;

//Creating the svg and applying styling and giving attributes
var svg = d3.select("svg")
    .style("background", "#000000")
    .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//Setting up the three variables x(equal width and mapping with country name), y(height) and z(color)
var x0 = d3.scaleBand().rangeRound([0, width-60]),
    x1 = d3.scaleBand().padding(0.05),
    y = d3.scaleLinear().rangeRound([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory20);

//Mapping the csv file to populate the column chart
d3.csv("Data/CO2_data.csv", function(d, i, columns) {
    for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
    return d;
}, function(error, data) {
    if (error) throw error;

    //mapping the variable with data in csv
    var values = data.columns.slice(1);

    //console.log(values);

    x0.domain(data.map(function(d) { return d.CountryName; }));

    x1.domain(values).rangeRound([0, x0.bandwidth()]);

    y.domain([0, d3.max(data, function(d) { return d3.max(values, function(key) { return d[key]; }); })]).nice();

    //Creating the columns using country name and CO2 emission values
    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" + x0(d.CountryName) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return values.map(function(key) { return {key: key, value: d[key]}; }); })
        .enter().append("rect")
        .attr("x", function(d) { return x1(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", function(d) { return z(d.key); })
        .style("stroke", "#fff");


    //Adding tooltip that shows value of each column
    svg.selectAll("g")
        .selectAll("rect").append("title")
        .text(function (d) {
            return ("CO2 Emission(kT) - " + (d.value))
        })

    //Creating x-axis and tick values using country name
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0))
        .selectAll('.tick text')
        .style("fill", "#fff");

    //Creating y-axis and the vertical CO2 axis title
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "15px")
        .style("fill", "#fff")
        .attr("font-weight", "bold")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .text("CO2 Emission (in million kT)");

    //Creating Y-axis tick values
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y).ticks(null, "s"))
        .selectAll('.tick text')
        .style("fill", "#fff");

    //Creating the Year legends using color scheme category20 and creating legend in reverse order of the years
    var legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(values.slice().reverse())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    //Creating rectangle for each year and filling with its respective color
    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    //Appending year as text value
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .style("fill", "#fff")
        .text(function(d) { return d; });
});

  }//end of Vis2
  vis2Init();
    vis1Init();
}])

.controller('CombinedController', ['$scope', function($scope) {
  //Combined controller code goes here
  function combinedInit(){
    var columns;
    // Chart columns.
var margin = {top: 50, right: 100, bottom: 10, left: 100},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// X-axis and y-axis scales.
var x = d3.scaleBand()
  .rangeRound([0, width])
  .padding(0.1),
  y = {};

//Creating the variables like line, axis, background, foreground.
var line = d3.line(),
  axis = d3.axisLeft(),
  background,
  foreground;

  //Creating tooltip for each line
  var red_tooltip = d3.select("#combined_svg")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .attr("class","tooltip");

//Create svg using the variables and applying background
var svg = d3.select("#combined_svg").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



//Mapping json and populating data
d3.json("Data/Complete.json", function(error, global_complete) {

  if (error) throw error;

  // Extract the list of columns and create a scale for each.

  x.domain(columns = d3.keys(global_complete[0]).filter(function(d) {
  return (y[d] = d3.scaleLinear()
    .domain(d3.extent(global_complete, function(p) { return +p[d]; }))
    .range([height, 0]));
  }));

  // Add grey background lines for context.
        var grey_background = svg.append("g")
    .attr("class", "background")
  .selectAll("path")
    .data(global_complete)
  .enter().append("path")
    .attr("d", pathFunction);

  // Add blue foreground lines for focus.
  var blue_foreground = svg.append("g")
		  .attr("class", "foreground")
		.selectAll("path")
		  .data(global_complete)
		.enter().append("path")
		  .attr("d", pathFunction)      //AB Segler's block
		  .on("mouseover", function(n){
			d3.select(this).transition().duration(100)
			  .style("stroke" , "#F00")
                .style('stroke-width', '2');
			red_tooltip.text(n.year).style("visibility", "visible");
		  return red_tooltip;})
		  .on("mouseout", function(d){
			d3.select(this).transition().duration(100)
			  .style("stroke", "steelblue")
                .style('stroke-width', 'initial');
		return red_tooltip.style("visibility", "hidden");
		});

  // Add a group element for each dimension.
  var g = svg.selectAll(".dimension")
    .data(columns)
  .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; });


  // Add an axis and title.
  g.append("g")
    .attr("class", "axis")
    .each(function(d) { d3.select(this).call(axis.scale(y[d])); });

  g.append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function(d) {return d;});

});

// Returns the path for a given data point.
  function pathFunction(d) {
    // console.log(columns);
    return line(columns.map(function(p) { return [x(p), y[p](d[p])]; }));
  }
  }
  combinedInit();
}])

.controller('DisasterController', ['$scope', function($scope) {
  //Disaster controller code goes here
}])

.controller('IceController', ['$scope', function($scope) {
  //Ice controller code goes here

function northPole(){

  var margin = { top: 0, right: 100, bottom: 40, left: 100 };
    var height = 500 - margin.top - margin.bottom;
    var width = 960 - margin.left - margin.right;

    var svg = d3.select("#northPole").append("svg")
        .attr("width",width + margin.left + margin.right)
        .attr("height",height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var xScale = d3.scalePoint().domain(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]).range([0, width]);
    var yScale = d3.scaleLinear().range([height, 0]);
    var color = d3.scaleLinear(d3.schemeBlues);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    //var bisectDate = d3.bisector(function(d) { return d.date; }).left;


    var line = d3.line()
      .curve(d3.curveBasis)
      .x(function(d) { return xScale(d.month); })
      .y(function(d) { return yScale(d.temp); });


      
    var focus = svg.append("g")
                .attr("class", "focus")
                .style("display","none");

    d3.csv("Data/IceExtent.csv", function(d){
      return {
        month: d['Month'],
        1979: +d['1979'],
        1980: +d['1980'],
        1981: +d['1981'],
        1982: +d['1982'],
        1983: +d['1983'],
        1984: +d['1984'],
        1985: +d['1985'],
        1986: +d['1986'],
        1987: +d['1987'],
        1988: +d['1988'],
        1989: +d['1989'],
        1990: +d['1990'],
        1991: +d['1991'],
        1992: +d['1992'],
        1993: +d['1993'],
        1994: +d['1994'],
        1995: +d['1995'],
        1996: +d['1996'],
        1997: +d['1997'],
        1998: +d['1998'],
        1999: +d['1999'],
        2000: +d['2000'],
        2001: +d['2001'],
        2002: +d['2002'],
        2003: +d['2003'],
        2004: +d['2004'],
        2005: +d['2005'],
        2006: +d['2006'],
        2007: +d['2007'],
        2008: +d['2008'],
        2009: +d['2009'],
        2010: +d['2010'],
        2011: +d['2011'],
        2012: +d['2012'],
        2013: +d['2013'],
        2014: +d['2014'],
        2015: +d['2015'],
        2016: +d['2016']

      };
    }, 
    function (error, data){
    var x = d3.keys(data[0]).filter(function(key) { return key !== "month"; });
    var i;
    for (i = 0; i < 12; i++)
    {
      x[i] = parseFloat(x[i]);
    }

    color.domain(x);
    var years = color.domain().map(function(year){
      return{
        year: year,
        values: data.map(function(d){
          return {month: d.month, temp: d[year]};
        })
      };
      })
    yScale.domain([
      3.5656,
      16.34194]);
    svg.append("g")
      .attr("class", "x iceAxis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // add the y axis
    svg.append("g")
        .attr("class", "y iceAxis")
        .call(yAxis)
      .append("text")
        .attr("transform","rotate(-90)")
        .attr("y",-40)
        .attr("dy",".71em")
        .style("text-anchor","end")
        .attr("fill", "#000")
        .text("Temperature");

    var allMonths = svg.selectAll(".eachMonth")
        .data(years)
      .enter().append("g")
        .attr("class","eachMonth");

    // add the stock price paths
    allMonths.append("path")
      .attr("class","line")
      .attr("id",function(d,i){ return "id" + i; })
      .attr("d", function(d) {
        return line(d.values); 
      })
      .style("stroke", function(d) { return color(d.year); });
    });
}
    function southPole(){
      var margin = { top: 0, right: 100, bottom: 40, left: 100 };
    var height = 500 - margin.top - margin.bottom;
    var width = 960 - margin.left - margin.right;

    var svg = d3.select("#southPole").append("svg")
        .attr("width",width + margin.left + margin.right)
        .attr("height",height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var xScale = d3.scalePoint().domain(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]).range([0, width]);
    var yScale = d3.scaleLinear().range([height, 0]);
    var color = d3.scaleLinear(d3.schemeBlues);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    //var bisectDate = d3.bisector(function(d) { return d.date; }).left;


    var line = d3.line()
      .curve(d3.curveBasis)
      .x(function(d) { return xScale(d.month); })
      .y(function(d) { return yScale(d.temp); });


      
    var focus = svg.append("g")
                .attr("class", "focus")
                .style("display","none");

    d3.csv("Data/IceExtent.csv", function(d){
      return {
        month: d['Month'],
        1979: +d['1979'],
        1980: +d['1980'],
        1981: +d['1981'],
        1982: +d['1982'],
        1983: +d['1983'],
        1984: +d['1984'],
        1985: +d['1985'],
        1986: +d['1986'],
        1987: +d['1987'],
        1988: +d['1988'],
        1989: +d['1989'],
        1990: +d['1990'],
        1991: +d['1991'],
        1992: +d['1992'],
        1993: +d['1993'],
        1994: +d['1994'],
        1995: +d['1995'],
        1996: +d['1996'],
        1997: +d['1997'],
        1998: +d['1998'],
        1999: +d['1999'],
        2000: +d['2000'],
        2001: +d['2001'],
        2002: +d['2002'],
        2003: +d['2003'],
        2004: +d['2004'],
        2005: +d['2005'],
        2006: +d['2006'],
        2007: +d['2007'],
        2008: +d['2008'],
        2009: +d['2009'],
        2010: +d['2010'],
        2011: +d['2011'],
        2012: +d['2012'],
        2013: +d['2013'],
        2014: +d['2014'],
        2015: +d['2015'],
        2016: +d['2016']

      };
    }, 
    function (error, data){
    var x = d3.keys(data[0]).filter(function(key) { return key !== "month"; });
    var i;
    for (i = 0; i < 12; i++)
    {
      x[i] = parseFloat(x[i]);
    }

    color.domain(x);
    var years = color.domain().map(function(year){
      return{
        year: year,
        values: data.map(function(d){
          return {month: d.month, temp: d[year]};
        })
      };
      })
    yScale.domain([
      3.5656,
      16.34194]);
    svg.append("g")
      .attr("class", "x iceAxis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // add the y axis
    svg.append("g")
        .attr("class", "y iceAxis")
        .call(yAxis)
      .append("text")
        .attr("transform","rotate(-90)")
        .attr("y",-40)
        .attr("dy",".71em")
        .style("text-anchor","end")
        .attr("fill", "#000")
        .text("Temperature");

    var allMonths = svg.selectAll(".eachMonth")
        .data(years)
      .enter().append("g")
        .attr("class","eachMonth");

    // add the stock price paths
    allMonths.append("path")
      .attr("class","line")
      .attr("id",function(d,i){ return "id" + i; })
      .attr("d", function(d) {
        return line(d.values); 
      })
      .style("stroke", function(d) { return color(d.year); });
    });       
    }
    northPole();
    southPole();
}])

    .controller('TemperatureController', ['$scope', function($scope) {
      //Temperature controller code goes here
      function globalTemperature(){
        var margin = { top: 0, right: 100, bottom: 40, left: 100 };
        var height = 500 - margin.top - margin.bottom;
        var width = 960 - margin.left - margin.right;

        var svg = d3.select("#globalTemperature").append("svg")
        .attr("width",width + margin.left + margin.right)
        .attr("height",height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        var xScale = d3.scaleTime().range([0, width]);
        var yScale = d3.scaleLinear().range([height, 0]);
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);


        var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.temp); });

        d3.csv("Data/newTemp.csv", function(d){
        return {
        date: new Date(d.date, 0),
        globalTemp: +d.Global
        };
        }, 
        function (error, data){
        data.sort(function(a, b){
        return a.date - b.date;
        });

        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));
        var years = color.domain().map(function(name){
        return{
        name: name,
        values: data.map(function(d){
          return {date: d.date, temp: d[name]};
        })
        };
        })
        xScale.domain([
        d3.min(years, function(c) { return d3.min(c.values, function(v) { return v.date; }); }),
        d3.max(years, function(c) { return d3.max(c.values, function(v) { return v.date; }); })
        ]);
        yScale.domain([
        -0.47,
        0.98]);
        //console.log(xScale.domain());
        svg.append("g")
        .attr("class", "x tempAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

        // add the y axis
        svg.append("g")
        .attr("class", "y tempAxis")
        .call(yAxis)
        .append("text")
        .attr("transform","rotate(-90)")
        .attr("y",-40)
        .attr("dy",".71em")
        .style("text-anchor","end")
        .attr("fill", "#000")
        .text("Temperature");

        var temp = svg.selectAll(".temps")
        .data(years)
        .enter().append("g")
        .attr("class","temps");

        // add the stock price paths
        temp.append("path")
        .attr("class","line")
        .attr("id",function(d,i){ return "id" + i; })
        .attr("d", function(d) {
        return line(d.values); 
        })
        .style("stroke", function(d) { return color(d.name); });

    });
    }

    function polarTemperature(){
        var margin = { top: 0, right: 100, bottom: 40, left: 100 };
        var height = 500 - margin.top - margin.bottom;
        var width = 960 - margin.left - margin.right;

        var svg = d3.select("#polarTemperature").append("svg")
            .attr("width",width + margin.left + margin.right)
            .attr("height",height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        var xScale = d3.scaleTime().range([0, width]);
        var yScale = d3.scaleLinear().range([height, 0]);
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

        var bisectDate = d3.bisector(function(d) { return d.date; }).left;


        var line = d3.line()
          .curve(d3.curveBasis)
          .x(function(d) { return xScale(d.date); })
          .y(function(d) { return yScale(d.temp); });


          
        var focus = svg.append("g")
                    .attr("class", "focus")
                    .style("display","none");

        d3.csv("Data/newTemp.csv", function(d){
          return {
            date: new Date(d.date, 0),
            north: +d.North,
            south: +d.South
          };
        }, 
        function (error, data){
          data.sort(function(a, b){
            return a.date - b.date;
          });

        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));
        var poles = color.domain().map(function(name){
          return{
            name: name,
            values: data.map(function(d){
              return {date: d.date, temp: d[name]};
            })
          };
          })
        xScale.domain([
          d3.min(poles, function(c) { return d3.min(c.values, function(v) { return v.date; }); }),
          d3.max(poles, function(c) { return d3.max(c.values, function(v) { return v.date; }); })
        ]);
        yScale.domain([
          -0.5,
          1.26]);
        svg.append("g")
          .attr("class", "x tempAxis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        // add the y axis
        svg.append("g")
            .attr("class", "y tempAxis")
            .call(yAxis)
          .append("text")
            .attr("transform","rotate(-90)")
            .attr("y",-40)
            .attr("dy",".71em")
            .style("text-anchor","end")
            .attr("fill", "#000")
            .text("Temperature");

        var pole = svg.selectAll(".poleNS")
            .data(poles)
          .enter().append("g")
            .attr("class","poleNS");

        // add the stock price paths
        pole.append("path")
          .attr("class","line")
          .attr("id",function(d,i){ return "id" + i; })
          .attr("d", function(d) {
            return line(d.values); 
          })
          .style("stroke", function(d) { return color(d.name); });
    });
}

globalTemperature();
polarTemperature();

}])
.controller('AboutController', ['$scope', function($scope) {
  //About controller code goes here
}])

//add any new controllers here for new pages if necessary

;
