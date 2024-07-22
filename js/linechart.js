const margin = { top: 20, right: 150, bottom: 50, left: 50 },
              width = 800 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

        // Append SVG object to the body of the page
        const svg = d3.select("#chart")
                      .append("svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                      .append("g")
                      .attr("transform", `translate(${margin.left},${margin.top})`);
        const tooltip = d3.select("body").append("div")
                      .attr("class", "tooltip")
                      .style("opacity", 0);

        // Load the data
        d3.csv("data/mean-years-of-schooling-long-run.csv").then(data => {
            // Filter data for the required entities
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

            // Add the lines and dots for each entity
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

            // Add dots
            svg.selectAll("dot")
               .data(worldData)
               .enter()
               .append("circle")
               .attr("cx", d => x(d.Year))
               .attr("cy", d => y(d.Education))
               .attr("r", 5)
               .attr("fill", "steelblue")
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
            });

            // // Add legend
            // const legend = svg.selectAll(".legend")
            //                   .data(entities)
            //                   .enter().append("g")
            //                   .attr("class", "legend")
            //                   .attr("transform", (d, i) => `translate(100,${i * 20})`);

            // legend.append("rect")
            //       .attr("x", width)
            //       .attr("width", 18)
            //       .attr("height", 18)
            //       .style("fill", d => colors[d]);

            // legend.append("text")
            //       .attr("x", width - 10)
            //       .attr("y", 9)
            //       .attr("dy", ".35em")
            //       .style("text-anchor", "end")
            //       .text(d => d);