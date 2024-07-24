document.getElementById("back-button").addEventListener("click", function() {
    window.location.href = "worldChloropleth.html";
});
// Load data and create the chart
d3.csv("data/mean-years-of-schooling-long-run.csv").then(data => {
    // Filter out regions and world values
    const filteredData = data.filter(d => !["World", "Africa", "Asia", "Europe", "North America", "Oceania", "South America"].includes(d.Entity));

    const countries = [...new Set(filteredData.map(d => d.Entity))].sort();

    const select = d3.select("#country-select");
    select.selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Set initial selected country
    const initialCountry = countries[0];
    createLineChart(filteredData, initialCountry);

    select.on("change", function() {
        const selectedCountry = this.value;
        createLineChart(filteredData, selectedCountry);
    });
});

function createLineChart(data, country) {
    // Filter data for the selected country
    const countryData = data.filter(d => d.Entity === country);

    // Parse the date and value
    countryData.forEach(d => {
        d.Year = +d.Year;
        d.Value = +d["Combined - average years of education for 15-64 years male and female youth and adults"];
    });

    // Set dimensions and margins of the graph
    const margin = {top: 20, right: 30, bottom: 40, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Remove existing SVG if any
    d3.select("#chart").selectAll("*").remove();

    // Append the svg object to the chart container
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    const x = d3.scaleLinear()
        .domain(d3.extent(countryData, d => d.Year))
        .range([0, width]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(countryData, d => d.Value)])
        .nice()
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
        .datum(countryData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.Year))
            .y(d => y(d.Value))
        );

    // Add points
    svg.selectAll("dot")
        .data(countryData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.Year))
        .attr("cy", d => y(d.Value))
        .attr("r", 3)
        .attr("fill", "red");

    // Add tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll("circle")
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Year: ${d.Year}<br>Mean Years of Schooling: ${d.Value}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add axis labels
    svg.append("text")
        .attr("transform", `translate(${width / 2},${height + margin.bottom})`)
        .style("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Mean Years of Schooling");

    const annotationData = filteredData.find(d => d.Year === 1950);
            
    svg.append("text")
        .attr("x", x(annotationData.Year) + 10)
        .attr("y", y(annotationData.Education) - 10)
        .attr("fill", "black")
        .text("Hover over points for data tooltip");
    svg.append("line")
        .attr("x1", x(annotationData.Year))
        .attr("y1", y(annotationData.Education))
        .attr("x2", x(annotationData.Year) + 10)
        .attr("y2", y(annotationData.Education) - 10)
        .attr("stroke", "black");
}