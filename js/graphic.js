const margin = { top: 50, right: 50, bottom: 50, left: 70 },
    width = 1200 - margin.left - margin.right, // Reduced width
    height = 600 - margin.top - margin.bottom; // Reduced height

// Create the SVG container
var svg = d3.select("#graphic")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
            `translate(${margin.left}, ${margin.top})`);

// Add a main title to the scatter plot
svg.append("text")
    .attr("x", (width / 2)) // Center the title
    .attr("y", -20) // Position above the plot
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Coronary Heart Disease vs Unemployment");

d3.csv("Merged_Job_Health.csv").then(data => {
    // Convert string values to numbers and include FIPS as the key
    data.forEach(d => {
        d.health = +d.percent_coronary_heart_disease; // Convert to number
        d.employment = +d.UnempRate2021; // Convert to number
        d.fips = d.FIPS; // Include FIPS as the key
        d.state = d.State;
        d.county = d.County; // Include county name
        d.fips = d.fips.toString().padStart(5, '0'); // Ensure FIPS is a 5-digit string
    });

    // Filter out entries with missing data
    const filteredData = data.filter(d => d.health !== null && d.employment !== null);

    // Get unique states for the selector
    const states = Array.from(new Set(filteredData.map(d => d.state))).sort();

    // Add state checkboxes
    const stateFilters = d3.select("#state-filters");
    states.forEach(state => {
        stateFilters.append("label")
            .text(state)
            .append("input")
            .attr("type", "checkbox")
            .attr("value", state)
            .attr("checked", true)
            .on("change", () => updateScatterPlot());
    });

    // Draw the scatterplot with the filtered data
    drawScatterPlot(filteredData);

    // Update scatterplot based on selected states
    function updateScatterPlot() {
        const selectedStates = Array.from(
            document.querySelectorAll("#state-filters input:checked")
        ).map(input => input.value);

        const updatedData = filteredData.filter(d => selectedStates.includes(d.state));
        drawScatterPlot(updatedData);
    }
});

// Function to draw the scatterplot
function drawScatterPlot(data) {
    // Clear existing elements
    svg.selectAll("*").remove();

    // Define the X axis (Unemployment Rate)
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.employment)]) // Adjust domain based on data
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 10)
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .text("Unemployment Rate (%)");

    // Define the Y axis (Coronary Disease Percentage)
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.health)]) // Adjust domain based on data
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .text("Coronary Disease (%)");

    // Create the tooltip outside the SVG
    var tooltip = d3.select("body")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid black")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("pointer-events", "none"); // Prevent tooltip from interfering with mouse events

    // Mouse event handlers
    var mouseover = function(event, d) {
        tooltip.style("opacity", 1);
    };

    var mousemove = function(event, d) {
        tooltip.html(
            "County: " + d.county + ", " + d.state + "<br>FIPS: " + d.fips +
            "<br>Unemployment Rate: " + d.employment + "%" +
            "<br>Coronary Disease: " + d.health + "%"
        )
        .style("left", (event.pageX + 10) + "px") // Offset tooltip slightly
        .style("top", (event.pageY - 20) + "px");
    };

    var mouseleave = function(event, d) {
        tooltip.style("opacity", 0);
    };

    // Add dots to the scatterplot
    svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.employment))
        .attr("cy", d => y(d.health))
        .attr("r", 5) // Increased radius for better visibility
        .style("fill", "#69b3a2")
        .style("opacity", 0.7)
        .style("stroke", "black")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
}