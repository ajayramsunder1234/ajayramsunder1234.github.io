document.getElementById("next-button").addEventListener("click", function() {
    window.location.href = "countrylinechart.html";
});
document.getElementById("back-button").addEventListener("click", function() {
    window.location.href = "worldlinechart.html";
});
// Dimensions and margins of the graph
const width = 960, height = 600;

// Append the svg object to the body of the page
const svg = d3.select("#chart")
              .append("svg")
              .attr("width", width)
              .attr("height", height);

// Create a tooltip
const tooltip = d3.select("body").append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

// Map and projection
const projection = d3.geoNaturalEarth1();
const path = d3.geoPath().projection(projection);

// Data and color scale
const data = new Map();
const colorScale = d3.scaleThreshold()
                     .domain([5, 10, 15, 20])
                     .range(d3.schemeBlues[5]);

// Load external data and boot
Promise.all([
    d3.json("https://unpkg.com/world-atlas@2/countries-110m.json"),
    d3.csv("data/mean-years-of-schooling-long-run.csv"),
    d3.json("data/regioncode.json")
]).then(loadData);

function loadData([topo, csvData, countriesJson]) {
    // Create a mapping from Alpha-3 codes to numeric region codes
    const alpha3ToNumeric = new Map();
    countriesJson.forEach(country => {
        alpha3ToNumeric.set(country["alpha-3"], country["country-code"]);
    });

    // Initialize data map
    const data = new Map();
    csvData.forEach(d => {
        if (d.Year === "2020") {
            const numericCode = alpha3ToNumeric.get(d.Code);
            if (numericCode) {
                data.set(numericCode, +d["Combined - average years of education for 15-64 years male and female youth and adults"]);
            }
        }
    });
    // Convert TopoJSON to GeoJSON
    const countries = topojson.feature(topo, topo.objects.countries).features;

    // Fit the projection to the size of the SVG container
    projection.fitSize([width, height], topojson.feature(topo, topo.objects.countries));

    // Draw the map
    svg.append("g")
       .selectAll("path")
       .data(countries)
       .join("path")
       .attr("fill", d => {
           d.value = data.get(d.id) || 0;
           return colorScale(d.value);
       })
       .attr("d", path)
       .style("stroke", "white")
       .on("mouseover", (event, d) => {
           tooltip.transition()
                  .duration(200)
                  .style("opacity", .9);
           tooltip.html(`Country: ${d.properties.name}<br>Mean Years of Schooling: ${d.value}`)
                  .style("left", (event.pageX) + "px")
                  .style("top", (event.pageY - 28) + "px");
       })
       .on("mouseout", () => {
           tooltip.transition()
                  .duration(500)
                  .style("opacity", 0);
       });

    // Add a color legend
    const legend = svg.append("g")
                      .attr("id", "legend");

    const legendData = colorScale.range().map(d => {
        const r = colorScale.invertExtent(d);
        if (!r[0]) r[0] = colorScale.domain()[0];
        if (!r[1]) r[1] = colorScale.domain()[colorScale.domain().length - 1];
        return r;
    });

    const legendWidth = 260;
    const legendHeight = 10;
    const legendMargin = 20;
    const legendX = width - legendWidth - legendMargin;
    const legendY = height - legendHeight - (legendMargin + 50);

    const legendScale = d3.scaleLinear()
                          .domain([0, 20])
                          .range([0, legendWidth]);

    legend.selectAll("rect")
          .data(legendData)
          .enter()
          .append("rect")
          .attr("x", (d, i) => legendX + i * (legendWidth / legendData.length))
          .attr("y", legendY)
          .attr("width", legendWidth / legendData.length)
          .attr("height", legendHeight)
          .style("fill", d => colorScale(d[0]));

    legend.append("g")
          .attr("transform", `translate(${legendX}, ${legendY + legendHeight})`)
          .call(d3.axisBottom(legendScale)
                .tickSize(13)
                .tickValues(colorScale.domain()));
}