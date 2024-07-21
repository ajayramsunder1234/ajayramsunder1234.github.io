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

        // Colors for each continent
        const colors = {
            "World": "steelblue",
            "Africa": "orange",
            "Asia": "green",
            "Europe": "red",
            "North America": "purple",
            "Oceania": "brown",
            "South America": "pink"
        };

        // Load the data
        d3.csv("mean-years-of-schooling-long-run.csv").then(data => {
            // Filter data for the required entities
            const entities = ["World", "Africa", "Asia", "Europe", "North America", "Oceania", "South America"];
            const filteredData = entities.map(entity => ({
                entity: entity,
                data: data.filter(d => d.Entity === entity)
                          .map(d => ({
                              Year: +d.Year,
                              Education: +d["Combined - average years of education for 15-64 years male and female youth and adults"]
                          }))
            }));

            // Set the scales
            const x = d3.scaleTime()
                        .domain(d3.extent(filteredData[0].data, d => d.Year))
                        .range([0, width]);
            const y = d3.scaleLinear()
                        .domain([0, d3.max(filteredData.flatMap(d => d.data), d => d.Education)])
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
            filteredData.forEach(group => {
                // Add the line
                const line = d3.line()
                               .x(d => x(d.Year))
                               .y(d => y(d.Education));

                const path = svg.append("path")
                                .datum(group.data)
                                .attr("fill", "none")
                                .attr("stroke", colors[group.entity])
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
                svg.selectAll(`dot-${group.entity}`)
                   .data(group.data)
                   .enter()
                   .append("circle")
                   .attr("cx", d => x(d.Year))
                   .attr("cy", d => y(d.Education))
                   .attr("r", 5)
                   .attr("fill", colors[group.entity])
                   .attr("opacity", 0)
                   .transition()
                   .delay((d, i) => i * 100)
                   .duration(500)
                   .attr("opacity", 1);
            });

            // Add legend
            const legend = svg.selectAll(".legend")
                              .data(entities)
                              .enter().append("g")
                              .attr("class", "legend")
                              .attr("transform", (d, i) => `translate(50,${i * 20})`);

            legend.append("rect")
                  .attr("x", width)
                  .attr("width", 18)
                  .attr("height", 18)
                  .style("fill", d => colors[d]);

            legend.append("text")
                  .attr("x", width - 10)
                  .attr("y", 9)
                  .attr("dy", ".35em")
                  .style("text-anchor", "end")
                  .text(d => d);
        });