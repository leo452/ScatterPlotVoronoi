async function drawScatter() {

  //Access the data
  const dataset = await d3.json(".//my_weather_data.json")

  console.table(dataset[0])
  const xAccessor = d=>d.dewPoint
  const yAccessor = d=>d.humidity

  //establish dimension of the chart
  const width = d3.min([
    window.innerHeight *0.9,
    window.innerWidth *0.9
  ])

  let dimensions = {
    width:width,
    height:width,
    margin: {
      top:10,
      right:10,
      bottom:50,
      left:50,
    },
  }
  dimensions.boundedWidth = dimensions.width
      -dimensions.margin.right
      -dimensions.margin.left
  dimensions.boundedHeight = dimensions.height
      -dimensions.margin.top
      -dimensions.margin.bottom
  //draw canvas

  const wrapper = d3.select("#wrapper").append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
  
  const bounds = wrapper.append("g")
      .style("transform", `translate(${
        dimensions.margin.left
      }px,${
        dimensions.margin.top
      }px)`)

  //Create Scales

  const yScale = d3.scaleLinear()
      .domain(d3.extent(dataset, yAccessor))
      .range([dimensions.boundedHeight, 0])
      .nice()

  const xScale = d3.scaleLinear()
      .domain(d3.extent(dataset, xAccessor))
      .range([0, dimensions.boundedWidth])
      .nice()
  //Draw Data
  const dots = bounds.selectAll("circle")
      .data(dataset).enter().append("circle")
          .attr("cx", d=>xScale(xAccessor(d)))
          .attr("cy", d=> yScale(yAccessor(d)))
          .attr("r", 5)
          .attr("fill", "cornflowerblue")

  const delaunay = d3.Delaunay.from(
    dataset,
    d=>xScale(xAccessor(d)),
    d=>yScale(yAccessor(d))
  )
  const voronoi = delaunay.voronoi()
  voronoi.xmax = dimensions.boundedWidth
  voronoi.ymax = dimensions.boundedHeight

  bounds.selectAll(".voronoi")
      .data(dataset).enter().append("path")
          .attr("class", "voronoi")
          .attr("d", (d,i)=> voronoi.renderCell(i))
          /* .attr("stroke", "salmon") */

  //draw Periphericals
  const xAxisGenerator = d3.axisBottom()
      .scale(xScale)

  const xAxis = bounds.append("g")
      .call(xAxisGenerator)
          .style("transform", `translateY(${dimensions.boundedHeight}px)`)

  const yAxisGenerator = d3.axisLeft()
      .scale(yScale)

  const yAxis = bounds.append("g")
      .call(yAxisGenerator)
  
  //Add interaction
  
  bounds.selectAll(".voronoi")
      .on("mouseenter", onMouseEnter)
      .on("mouseleave", onMouseLeave)

  const tooltip = d3.select("#tooltip")

  function onMouseEnter(datum){
    const dotDay = bounds.append("circle")
        .attr("class", "tooltipDot")
        .attr("cx", xScale(xAccessor(datum)) )
        .attr("cy", yScale(yAccessor(datum)))
        .attr("r",7 )
        .style("fill", "maroon" )

    const humidityFormat = d3.format(".2f")
    tooltip.select("#humidity")
       .text(humidityFormat(yAccessor(datum)))

    const dewPointFormat = d3.format(".2f")
    tooltip.select("#dew-point")
        .text(dewPointFormat(xAccessor(datum)))

    const dateParse = d3.timeParse("%Y-%m-%d")
    const dateFormat = d3.timeFormat("%B %A %-d,%Y")
    tooltip.select("#date")
        .text(dateFormat(dateParse(datum.date)))

    const x = xScale(xAccessor(datum)) + dimensions.margin.left
    const y = yScale(yAccessor(datum)) + dimensions.margin.top

    tooltip.style("transform", `translate(`
    + `calc( -50% + ${x}px),`
    + `calc(-100% + ${y}px)`
    + `)`)

    tooltip.style("opacity",1)
  }
  function onMouseLeave(){
    bounds.selectAll(".tooltipDot")
        .remove()
    tooltip.style("opacity",0)
  }

}
drawScatter()