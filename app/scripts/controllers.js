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
  var mappingArea = document.getElementById("mapArea");
  var areaDims = mappingArea.getBoundingClientRect();
  var width = areaDims.width;
      height = areaDims.height;
  var projection, path, graticule, svg, svgCarbon, currentYear, startYear, endYear, countries, playing, numberOfDisasters, radialGradient, carbonValue, countryValues;
  var world, temperature, extremeTemp, droughts, globalCO2, floods, storms, tropicalCyclones, co2Measure;
  playing = false;
  startYear = 1960;
  endYear = 2012;
  currentYear = startYear;
  numberOfDisasters = 0;

  var minimumTemp = -2.303, maximumTemp = 3.599;
  var minCO2 = 7.757095562, maxCO2 = 8.502491904;

  var colorsTemp = d3.scaleLinear()
      .domain(d3.ticks(minimumTemp, maximumTemp, 5))
      //.range(['#d7191c','#fdae61','#ffffbf','#abdda4','#2b83ba']);
     .range(['#feedde','#fdbe85','#fd8d3c','#e6550d','#a63603']);
  //console.log(colorsTemp.range());
  var radius = d3.scaleSqrt()
      .domain([0, 7])
      .range([0, 15]);

  var colorsCO2 = d3.scaleLinear()
      .domain(d3.ticks(minCO2, maxCO2, 3))
      .range(['#d9d9d9','#969696','#252525']);
      //.range(["#dcdcdc", "#ababab", "#7a7a7a", "#494949", "#313131"]);
  //console.log(colorsCO2.range());
  //console.log(colorsCO2.domain()[0]);
  d3.select('#rangeSlider').on('input', function() {
    currentYear = this.value;
    d3.select('#year').html(currentYear);
    svg.selectAll("g")
              .transition()
              .remove();
      svg.selectAll("radialGradient")
              .transition()
              .remove();
    joinData();
    d3.select('.disasterNo').html(numberOfDisasters);
    d3.select('.co2Value').html(carbonValue);
  });

  function initializeMap(){
    setMap();
    animate();
  }

  function setMap(){
    projection = d3.geoWinkel3()
                   .scale(100)
                   .translate([width/2, height/2])
                   .precision(.1);
    path = d3.geoPath()
            .projection(projection);

    graticule = d3.geoGraticule();

    svg = d3.select("#mapArea")
            .insert("svg")
            .attr("width", width)
            .attr("height", height);

    svg.enter().insert(".stroke");

    svg.append("defs").append("path")
        .datum({type: "Sphere"})
        .attr("id", "sphere")
        .attr("d", path);

     svg.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");

    svg.append("use")
        .attr("class", "fill")
        .attr("xlink:href", "#sphere");

    var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

    addLegend();
    loadData();
  }

  function loadData(){
    queue()
    .defer(d3.json, "./Data/world110m.json")
    .defer(d3.json, "./Data/tempAnomaly.json")
    .defer(d3.json, "./Data/tropicalCyclones.json")
    .defer(d3.json, "./Data/storms.json")
    .defer(d3.json, "./Data/droughts.json")
    .defer(d3.json, "./Data/floods.json")
    .defer(d3.json, "./Data/extremeTemp.json")
    .defer(d3.json, "./Data/globalCO2.json")
    .await(worldMap);
  }

  function addLegend(){
    var areaDims = legendArea.getBoundingClientRect();
    var legendWidth = areaDims.width;
        legendHeight = areaDims.height;
    var svgLegend = d3.selectAll("#legendArea")
            .insert("svg")
            .data(colorsTemp.domain())
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .attr("class", "legend");
    /*svgLegend.append("circle")
        .attr("class", "legend")
        .attr("cx", 12)
        .attr("cy", 100)
        .attr("r", 12)
        .style("fill", "rgb(53, 135, 212");*/

    var cellWidth = 20, cellHeight = 20;
    svgLegend.append("text")
        .attr("x", 5)
        .attr("y", function(){return legendHeight/4})
        .style("font-weight", "bold")
        .text("DISASTERS");
    svgLegend.append("rect")
          .attr("x", 5)
          .attr("y", function(){return legendHeight/4 + 20})
          .attr("width", cellWidth)
          .attr("height", cellHeight)
          .style("fill", "#08519c")
          .style("opacity", 0.8);

    svgLegend.append("rect")
          .attr("x", 5)
          .attr("y", function(){return legendHeight/4 + 50})
          .attr("width", cellWidth)
          .attr("height", cellHeight)
          .style("fill", "#006d2c")
          .style("opacity", 0.8);

    svgLegend.append("rect")
          .attr("x", 5)
          .attr("y", function(){return legendHeight/4 + 80;})
          .attr("width", cellWidth)
          .attr("height", cellHeight)
          .style("fill", "#993404")
          .style("opacity", 0.8);

    svgLegend.append("rect")
        .attr("x", 5)
          .attr("y", function(){return legendHeight/4 + 110;})
          .attr("width", cellWidth)
          .attr("height", cellHeight)
          .style("fill", "#810f7c")
          .style("opacity", 0.8);

    svgLegend.append("rect")
        .attr("x", 5)
          .attr("y", function(){return legendHeight/4 + 140;})
          .attr("width", cellWidth)
          .attr("height", cellHeight)
          .style("fill", "#ff9933")
          .style("opacity", 0.8);

    svgLegend.append("text")
        .attr("x", 30)
        .attr("y", function(){return legendHeight/4 + 35;})
        .text("Tropical Cyclones");

    svgLegend.append("text")
        .attr("x", 30)
        .attr("y", function(){return legendHeight/4 + 65;})
        .text("Storms");

    svgLegend.append("text")
        .attr("x", 30)
        .attr("y", function(){return legendHeight/4 + 95;})
        .text("Droughts");

    svgLegend.append("text")
        .attr("x", 30)
        .attr("y", function(){return legendHeight/4 + 125;})
        .text("Floods");

    svgLegend.append("text")
        .attr("x", 30)
        .attr("y", function(){return legendHeight/4 + 155;})
        .text("Extreme Temperatures");
  }

  function worldMap(error, a, b, c, d, e, f, g, h){
    world = a;
    temperature = b;
    tropicalCyclones = c;
    storms = d;
    droughts = e;
    floods = f;
    extremeTemp = g;
    globalCO2 = h;
    countries = topojson.feature(world, world.objects.countries).features;
    numberOfDisasters = 0;
    createMap();
    joinData();
  }
  function joinData(){

    numberOfDisasters = 0;
    countries.forEach(function(country){

      //temperature

      var temp = temperature.filter(function(temperature){
        return temperature['Country Code'] == country.id;
      });
      country.temperature = (temp[0] != undefined) ? temp[0][String(currentYear)] : null;
      country.name = (temp[0] != undefined) ? temp[0]['Country'] : null;

      //Tropical tropicalCyclones

      var trC = tropicalCyclones.filter(function(tropicalCyclones){
        return tropicalCyclones['CountryCode'] == country.id;
      });
      country.tropicalCyclones = (trC[0] != undefined) ? trC[0][currentYear] : null;
      if (country.tropicalCyclones > 0 ){
        numberOfDisasters = numberOfDisasters + 1;
      }
      //Storms

      var storm = storms.filter(function(storms){
      return storms['CountryCode'] == country.id;
      });
      country.storms = (storm[0] != undefined) ? storm[0][currentYear] : null;
      if (country.storms > 0 ){
        numberOfDisasters = numberOfDisasters + 1;
      }
      //Droughts

      var drought = droughts.filter(function(droughts){
        return droughts['CountryCode'] == country.id;
      });
      country.droughts = (drought[0] != undefined) ? drought[0][currentYear] : null;
      if (country.droughts > 0 ){
        numberOfDisasters = numberOfDisasters + 1;
      }
      //Floods

      var flood = floods.filter(function(floods){
        return floods['CountryCode'] == country.id;
      });
      country.floods = (flood[0] != undefined) ? flood[0][currentYear]: null;
      if (country.floods > 0 ){
        numberOfDisasters = numberOfDisasters + 1;
      }
      //Extreme Temperatures

      var extrTemp = extremeTemp.filter(function(extremeTemp){
        return extremeTemp['CountryCode'] == country.id;
      });
      country.extremeTemp = (extrTemp[0] != undefined) ? extrTemp[0][currentYear] : null;
      if (country.storms > 0 ){
        numberOfDisasters = numberOfDisasters + 1;
      }
    });

    co2Measure = globalCO2.filter(function(co2){
      return co2['Year'] == currentYear;
    });

    carbonValue = co2Measure[0]['Total'];

    fillMap();

  }

  function createMap(){

    svg.selectAll(".country")
      .data(countries)
      .enter().insert("path", ".graticule")
      .attr("class", "country")
      .attr("d", path);

    svg.insert("path", ".graticule")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      .attr("class", "boundary")
      .attr("d", path);
  }

  function fillMap(){

    svg.selectAll(".country")
      .data(countries)
      .transition()
      .style("fill", function(d){return colorsTemp(d.temperature)});

    svg.selectAll(".country")
      .data(countries)
      .on('mouseover', function(d){
        d3.select(this).style('fill-opacity', 0.5);
        d3.select("#countryDetails").text(function(){var details = d.name + ":\r\n" + parseFloat(Math.round(d.temperature * 1000) / 1000).toFixed(3); return details;});
        //console.log(d.temperature);
      })
      .on('mouseout', function(){
        d3.select(this).style('fill-opacity', 1);
        d3.select("#countryDetails").text("Country");
      });

    var carbonColor = colorsCO2(co2Measure[0]['Log10']);

    radialGradient = svg.append("defs")
      .append("radialGradient")
      .attr("id", "radial-gradient");

    radialGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", function(){console.log(co2Measure[0]['Log10']); return carbonColor});

    radialGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#fefefe");

    svg.selectAll("#sphere")
      .transition()
      .style("fill", "url(#radial-gradient)")
      .style("fill-opacity", 0.75);

    svg.append("g")
      .attr("class", "bubble")
      .selectAll("circle")
      .data(countries)
      .enter().append("circle")
      //.transition()
      .style("fill", "#08519c")
      .style("fill-opacity", 0.75)
      .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
      .attr("r", function(d){return radius(d.tropicalCyclones);});

    svg.append("g")
      .attr("class", "bubble")
      .selectAll("circle")
      .data(countries)
      .enter().append("circle")
      //.transition()
      .style("fill", "#006d2c")
      .style("fill-opacity", 0.75)
      .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
      .attr("r", function(d){return radius(d.storms);});

    svg.append("g")
      .attr("class", "bubble")
      .selectAll("circle")
      .data(countries)
      .enter().append("circle")
      //.transition()
      .style("fill", "#993404")
      .style("fill-opacity", 0.75)
      .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
      .attr("r", function(d){return radius(d.droughts);});

    svg.append("g")
      .attr("class", "bubble")
      .selectAll("circle")
      .data(countries)
      .enter().append("circle")
      //.transition()
      .style("fill", "#810f7c")
      .style("fill-opacity", 0.75)
      .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
      .attr("r", function(d){return radius(d.floods);});

    svg.append("g")
      .attr("class", "bubble")
      .selectAll("circle")
      .data(countries)
      .enter().append("circle")
      //.transition()
      .style("fill", "#ff9933")
      .style("fill-opacity", 0.75)
      .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
      .attr("r", function(d){return radius(d.extremeTemp);});



/*			var areaDims = carbonLevels.getBoundingClientRect();
    var cWidth = areaDims.width;
        cHeight = areaDims.height;
    svgCarbon = d3.selectAll("#carbonLevels")
            .insert("svg")
            .data(colorsTemp.domain())
            .attr("width", cWidth)
            .attr("height", cHeight)
            .attr("class", "carbonLevels");

    svgCarbon.append("text")
          .attr("x", 5)
          .attr("y", cHeight/4)
          .style("font-weight", "bold")
          .text("CARBON LEVELS");

    carbonValue = svgCarbon.append("text")
          .attr("id", "carbonValue")
          .attr("x", 5)
          .attr("y", cHeight/4 + 30)
          .style("font-weight", "bold")
          .text(function(){return co2Measure[0]['Log10'];});
*/
  }

  function animate(){
    var timer;
    d3.select('#start')
      .on('click', function() {
        if(playing == false) {
          var b= d3.select("#rangeSlider");
          if (b.property("value") != 1960){
            currentYear = parseInt(b.property("value"));
            console.log(currentYear);
          }
          timer = setInterval(function(){
        if(currentYear < endYear) {
              currentYear +=1;
            }
            else {
              currentYear = startYear;
              clearInterval(timer);
            }
            var b= d3.select("#rangeSlider");
          b.property("value", currentYear);
          console.log(b.property("value"));
            svg.selectAll("g")
              .transition()
              .remove();
            svg.selectAll("radialGradient")
              .transition()
              .remove();
            joinData();
            d3.select('#year').html(currentYear);
            d3.select('.co2Value').html(carbonValue);
            d3.select('.disasterNo').html(numberOfDisasters);
          }, 1000);

          d3.select(this).html('stop');
          playing = true;
        }
        else {
          clearInterval(timer);
          d3.select(this).html('play');
          playing = false;
        }
    });
  }

  initializeMap();

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
