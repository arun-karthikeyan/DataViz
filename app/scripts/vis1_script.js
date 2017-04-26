/**
 * Created by uutka on 4/13/2017.
 */
$(document).ready(function() {
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
    d3.json("CO2_nations_data.json", function (country) {

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
});
