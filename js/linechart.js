// Set dimensions and margins for the graph
const margin = { top: 20, right: 30, bottom: 40, left: 50 },
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Append SVG object to the body of the page
const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

// Load the data
d3.csv("mean-years-of-schooling-long-run.csv").then(data => {
    // Filter the data to include only the World entity from 1870 to 2020
    const worldData = data.filter(d => d.Entity === "World");

    // Parse the data
    worldData.forEach(d => {
        d.Year = +d.Year;
        d.Education = +d["Combined - average years of education for 15-64 years male and female youth and adults"];
    });

    // Set the scales
    const x = d3.scaleTime()
                .domain(d3.extent(worldData, d => d.Year))
                .range([0, width]);
    const y = d3.scaleLinear()
                .domain([0, d3.max(worldData, d => d.Education)])
                .range([height, 0]);

    // Add the X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Year");

    // Add the Y axis
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .text("Average Years of Education");

    // Add the line
    const line = d3.line()
                    .x(d => x(d.Year))
                    .y(d => y(d.Education));

    const path = svg.append("path")
                    .datum(worldData)
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .attr("d", line);

    // Animation
    const totalLength = path.node().getTotalLength();

    path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(4000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    svg.selectAll("dot")
        .data(worldData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.Year))
        .attr("cy", d => y(d.Education))
        .attr("r", 5)
        .attr("fill", "steelblue")
        .attr("opacity", 0)
        .transition()
        .delay((d, i) => i * 100)
        .duration(500)
        .attr("opacity", 1);
});