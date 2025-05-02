(() => {
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 960 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // Create the SVG container inside the #map div
    const svg = d3.select("#map")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create a tooltip
    const tooltip = d3.select("body")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid black")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("pointer-events", "none"); // Prevent tooltip from interfering with mouse events

    // Load the data and render the map
    d3.csv("Merged_Job_Health.csv").then(data => {
        // Convert string values to numbers and include FIPS as the key
        data.forEach(d => {
            d.health = +d.percent_coronary_heart_disease; // Convert to number
            d.employment = +d.UnempRate2021; // Convert to number
            d.state = d.State; // Store state name
            d.county = d.County; // Store county name
            d.fips = d.FIPS.toString().padStart(5, '0'); // Ensure FIPS is a 5-digit string
        });

        // Calculate averages for coronary heart disease and unemployment
        const avgUnemployment = d3.mean(data, d => d.employment);
        const avgCoronary = d3.mean(data, d => d.health);

        // Function to calculate the Stress Correlation Index
        function calculateStressIndex(unemployment, coronary) {
            if (unemployment > avgUnemployment && coronary > avgCoronary) {
                return "High";
            } else if (unemployment > avgUnemployment || coronary > avgCoronary) {
                return "Medium";
            } else {
                return "Low";
            }
        }

        // Define the map projection and path generator
        const projection = d3.geoAlbersUsa()
            .scale(1000)
            .translate([width / 2, height / 2]);
        const geopath = d3.geoPath().projection(projection);

        // Define more distinct color scales
        const colorScales = {
            employment: d3.scaleSequential(d3.interpolateYlGnBu).domain([0, 15]), // Brutal scaling for unemployment
            health: d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 20]) // Brutal scaling for coronary heart disease
        };

        // Load GeoJSON data for the map
        d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json").then(us => {
            const counties = topojson.feature(us, us.objects.counties).features;

            // Create a lookup for data by FIPS
            const dataLookup = {};
            data.forEach(d => {
                dataLookup[d.fips] = d;
            });

            // Function to update the map based on the selected data type
            function updateMap(dataType) {
                svg.selectAll("path").remove(); // Clear existing paths

                svg.selectAll("path")
                    .data(counties)
                    .join("path")
                    .attr("d", geopath)
                    .attr("fill", d => {
                        const countyData = dataLookup[d.id];
                        if (countyData) {
                            return colorScales[dataType](countyData[dataType]);
                        }
                        return "#d3d3d3"; // Default color for missing data
                    })
                    .attr("stroke", "#fff")
                    .on("mouseover", function (event, d) {
                        const countyData = dataLookup[d.id];
                        if (countyData) {
                            // Calculate the Stress Correlation Index
                            const stressIndex = calculateStressIndex(countyData.employment, countyData.health);

                            // Bold the selected statistic and include the other statistic unbolded
                            const stats = dataType === "employment"
                                ? `<strong>Unemployment Rate:</strong> <b>${countyData.employment}%</b><br>
                                   <strong>Coronary Heart Disease:</strong> ${countyData.health}%`
                                : `<strong>Unemployment Rate:</strong> ${countyData.employment}%<br>
                                   <strong>Coronary Heart Disease:</strong> <b>${countyData.health}%</b>`;
                            
                            tooltip.style("opacity", 1)
                                .html(`
                                    <strong>County:</strong> ${countyData.county || "Unknown"}<br>
                                    <strong>State:</strong> ${countyData.state || "Unknown"}<br>
                                    ${stats}<br>
                                    <strong>Stress Correlation Index:</strong> ${stressIndex}
                                `)
                                .style("left", (event.pageX + 10) + "px") // Offset tooltip slightly
                                .style("top", (event.pageY - 20) + "px");

                            // Update the secondary dashboard
                            updateDashboard(countyData, avgUnemployment, avgCoronary);
                        }
                        d3.select(this).attr("stroke", "#000");
                    })
                    .on("mousemove", function (event, d) {
                        tooltip.style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 20) + "px");
                    })
                    .on("mouseout", function () {
                        tooltip.style("opacity", 0);
                        d3.select(this).attr("stroke", "#fff");
                    });
            }

            // Initialize the map with unemployment data
            updateMap("employment");

            // Add event listener to the toggle switch
            d3.select("#data-toggle").on("change", function () {
                const selectedData = d3.select(this).property("value");
                updateMap(selectedData);
            });
        });
    });
})();

export function drawScatterPlot(data) {
    // Implementation of drawScatterPlot
    console.log("Drawing scatter plot with data:", data);
}

// Add brushing functionality to the scatterplot
function addBrushingFeature(data) {
    // Create a group for the brush
    const brush = d3.brush()
        .extent([[0, 0], [width, height]]) // Define the brush area
        .on("start brush end", brushed);

    const brushGroup = svg.append("g")
        .attr("class", "brush")
        .call(brush);

    let brushedData = [];

    // Function to handle brushing
    function brushed(event) {
        const selection = event.selection;

        if (selection) {
            const [[x0, y0], [x1, y1]] = selection;

            // Filter data points within the brush selection
            brushedData = data.filter(d => {
                const xValue = x(d.employment);
                const yValue = y(d.health);
                return xValue >= x0 && xValue <= x1 && yValue >= y0 && yValue <= y1;
            });
        } else {
            brushedData = []; // Clear brushed data if brush is cleared
        }
    }

    // Add event listener to the button
    d3.select("#brush-trigger").on("click", () => {
        if (brushedData.length > 0) {
            // Calculate statistics for the brushed data
            const namesAndStates = brushedData.map(d => `${d.county}, ${d.state}`).join("<br>");
            const avgCoronary = d3.mean(brushedData, d => d.health).toFixed(2);
            const avgUnemployment = d3.mean(brushedData, d => d.employment).toFixed(2);
            const highestCoronary = brushedData.reduce((max, d) => d.health > max.health ? d : max, brushedData[0]);
            const highestUnemployment = brushedData.reduce((max, d) => d.employment > max.employment ? d : max, brushedData[0]);

            // Update the tooltip with brushed data
            tooltip.style("opacity", 1)
                .html(`
                    <strong>Brushed Counties:</strong><br>${namesAndStates}<br><br>
                    <strong>Average Coronary Disease:</strong> ${avgCoronary}%<br>
                    <strong>Average Unemployment:</strong> ${avgUnemployment}%<br>
                    <strong>Highest Coronary Disease:</strong> ${highestCoronary.county}, ${highestCoronary.state} (${highestCoronary.health}%)<br>
                    <strong>Highest Unemployment:</strong> ${highestUnemployment.county}, ${highestUnemployment.state} (${highestUnemployment.employment}%)
                `)
                .style("left", "50px") // Position tooltip near the button
                .style("top", "50px");
        } else {
            tooltip.style("opacity", 0); // Hide tooltip if no data is brushed
        }
    });
}

// Call the brushing feature after drawing the scatterplot
d3.csv("Merged_Job_Health.csv").then(data => {
    // Process data as before
    data.forEach(d => {
        d.health = +d.percent_coronary_heart_disease;
        d.employment = +d.UnempRate2021;
        d.fips = d.FIPS.toString().padStart(5, '0');
        d.state = d.State;
        d.county = d.County;
    });

    const filteredData = data.filter(d => d.health !== null && d.employment !== null);

    // Draw the scatterplot
    drawScatterPlot(filteredData);

    // Add brushing feature
    addBrushingFeature(filteredData);
});
