/**
 * Created by uutka on 4/25/2017.
 */


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
