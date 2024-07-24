document.getElementById("next-button").addEventListener("click", function() {
    window.location.href = "worldChloropleth.html";
});
document.getElementById("back-button").addEventListener("click", function() {
    window.location.href = "index.html";
});
const margin = { top: 20, right: 50, bottom: 50, left: 50 },
              width = 800 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

        // Append SVG object to the body of the page
        const svg = d3.select("#chart")
                      .append("svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                      .append("g")
                      .attr("transform", `translate(${margin.left},${margin.top})`);

        // Colors for the World data
        const color = "steelblue";

        // Tooltip div
        const tooltip = d3.select("body").append("div")
                          .attr("class", "tooltip")
                          .style("opacity", 0);

        function wrap(text, width) {
            text.each(function() {
                const text = d3.select(this);
                const words = text.text().split(/\s+/).reverse();
                let word;
                let line = [];
                let lineNumber = 0;
                const lineHeight = 1.1;
                const x = text.attr("x");
                const y = text.attr("y");
                const dy = parseFloat(text.attr("dy") || 0);
                let tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                }
        })}
        // Load the data
        d3.csv("data/mean-years-of-schooling-long-run.csv").then(data => {
            // Filter data for the World
            const filteredData = data.filter(d => d.Entity === "World" && +d.Year >= 1870 && +d.Year <= 2020)
                                     .map(d => ({
                                         Year: +d.Year,
                                         Education: +d["Combined - average years of education for 15-64 years male and female youth and adults"]
                                     }));

            // Set the scales
            const x = d3.scaleTime()
                        .domain(d3.extent(filteredData, d => d.Year))
                        .range([0, width]);
            const y = d3.scaleLinear()
                        .domain([0, d3.max(filteredData, d => d.Education)])
                        .range([height, 0]);

            // Add the X axis
            svg.append("g")
               .attr("transform", `translate(0,${height})`)
               .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));

            // Add the X axis label
            svg.append("text")
               .attr("text-anchor", "end")
               .attr("x", width / 2)
               .attr("y", height + margin.bottom - 10)
               .text("Year");

            // Add the Y axis
            svg.append("g")
               .call(d3.axisLeft(y));

            // Add the Y axis label
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
                            .datum(filteredData)
                            .attr("fill", "none")
                            .attr("stroke", color)
                            .attr("stroke-width", 1.5)
                            .attr("d", line);

            // Animation
            const totalLength = path.node().getTotalLength();

            path.attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(1200)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0);

            // Add dots
            svg.selectAll("dot")
               .data(filteredData)
               .enter()
               .append("circle")
               .attr("cx", d => x(d.Year))
               .attr("cy", d => y(d.Education))
               .attr("r", 5)
               .attr("fill", color)
               .on("mouseover", (event, d) => {
                    tooltip.transition()
                           .duration(200)
                           .style("opacity", .9);
                    tooltip.html(`Year: ${d.Year}<br/>Education: ${d.Education}`)
                           .style("left", (event.pageX + 5) + "px")
                           .style("top", (event.pageY - 28) + "px");
               })
               .on("mouseout", () => {
                    tooltip.transition()
                           .duration(500)
                           .style("opacity", 0);
               })
               .attr("opacity", 0)
               .transition()
               .delay((d, i) => i * 100)
               .duration(500)
               .attr("opacity", 1);
               
               const annotationData = filteredData.find(d => d.Year === 1950);
                svg.append("text")
                .attr("x", x(annotationData.Year) - 60) // Adjusted x position
                .attr("y", y(annotationData.Education) - 30)
                .attr("fill", "black")
                .text("Hover over points for data tooltip")
                .call(wrap, 150);

                const annotationDataHighest = filteredData.find(d => d.Year === 2020);
                svg.append("text")
                .attr("x", x(annotationDataHighest.Year) - 250) // Adjusted x position
                .attr("y", y(annotationDataHighest.Education) - 10)
                .attr("fill", "black")
                .text(`2020 Education value: ${annotationDataHighest.Education}`)
                .call(wrap, 75);
                svg.append("line")
                .attr("x1", x(annotationDataHighest.Year))
                .attr("y1", y(annotationDataHighest.Education))
                .attr("x2", x(annotationDataHighest.Year) + 240)
                .attr("y2", y(annotationDataHighest.Education) - 10)
                .attr("stroke", "black");

                const annotationDataLowest = filteredData.find(d => d.Year === 1915);
                svg.append("text")
                .attr("x", x(annotationDataLowest.Year) - 60) // Adjusted x position
                .attr("y", y(annotationDataLowest.Education) + 20)
                .attr("fill", "black")
                .text(`1915 Education value: ${annotationDataLowest.Education}`)
                .call(wrap, 75);
                svg.append("line")
                .attr("x1", x(annotationDataLowest.Year))
                .attr("y1", y(annotationDataLowest.Education))
                .attr("x2", x(annotationDataLowest.Year) + 10)
                .attr("y2", y(annotationDataLowest.Education) + 30)
                .attr("stroke", "black");
            });

