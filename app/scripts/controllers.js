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
  
}])

.controller('DisasterController', ['$scope', function($scope) {
  //Disaster controller code goes here
}])

.controller('IceController', ['$scope', function($scope) {
  //Ice controller code goes here
}])

.controller('TemperatureController', ['$scope', function($scope) {
  //Temperature controller code goes here
}])

.controller('AboutController', ['$scope', function($scope) {
  //About controller code goes here
}])

//add any new controllers here for new pages if necessary

;
