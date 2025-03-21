// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Select the existing SVG in index.html and append a group for chart content
const svg1_IncidentsTrend = d3.select("#lineChart1")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip setup
const tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background-color", "white")
    .style("padding", "5px")
    .style("border", "1px solid black")
    .style("pointer-events", "none");

// 2.a: LOAD CSV DATA
d3.csv("aircraft_incidents.csv").then(data => {

    // 2.b: TRANSFORM DATA (support flexible column naming)
    data.forEach(d => {
        d.Year = +d.year || +d.Year;  // Handle either 'year' or 'Year' columns
    });
    const yearCounts = d3.rollups(data, v => v.length, d => d.Year);
    const incidentsData = yearCounts.map(d => ({ year: d[0], count: d[1] })).sort((a, b) => a.year - b.year);

    // 3.a: SCALES
    const xScale1 = d3.scaleLinear()
        .domain(d3.extent(incidentsData, d => d.year))
        .range([0, width]);

    const yScale1 = d3.scaleLinear()
        .domain([0, d3.max(incidentsData, d => d.count)])
        .range([height, 0]);

    // 4.a: LINE GENERATOR
    const line1 = d3.line()
        .x(d => xScale1(d.year))
        .y(d => yScale1(d.count));

    // 4.b: DRAW LINE
    svg1_IncidentsTrend.append("path")
        .datum(incidentsData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line1);

    // 5.a: AXES
    svg1_IncidentsTrend.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale1).tickFormat(d3.format("d")));

    svg1_IncidentsTrend.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale1));

    // 6.a: AXIS LABELS & TITLE
    svg1_IncidentsTrend.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")

    svg1_IncidentsTrend.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Year");

    svg1_IncidentsTrend.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Number of Incidents");

    // 7.a: INTERACTIVITY - POINTS AND TOOLTIP
    svg1_IncidentsTrend.selectAll("circle")
        .data(incidentsData)
        .join("circle")
        .attr("cx", d => xScale1(d.year))
        .attr("cy", d => yScale1(d.count))
        .attr("r", 4)
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`Year: ${d.year}<br>Incidents: ${d.count}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));

    // Interactive widget
    const yearDropdown = d3.select("#yearDropdown");

    yearDropdown.selectAll("option")
        .data(incidentsData.map(d => d.year))  // Extract only the years
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    function updateChartByDropdown(selectedYear) {
        svg1_IncidentsTrend.selectAll(".highlighted-point").remove();

        const selectedData = incidentsData.find(d => d.year == selectedYear);

        if (selectedData) {
            svg1_IncidentsTrend.append("circle")
                .attr("class", "highlighted-point")
                .attr("cx", xScale1(selectedData.year))
                .attr("cy", yScale1(selectedData.count))
                .attr("r", 5)
                .attr("fill", "tomato")
                .attr("stroke-width", 2)
                .on("mouseover", (event, d) => {
                    tooltip.style("opacity", 1)
                        .html(`Year: ${selectedData.year}<br>Incidents: ${selectedData.count}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mouseout", () => tooltip.style("opacity", 0));
        }
    }

    yearDropdown.on("change", function () {
        updateChartByDropdown(this.value);
    });

});