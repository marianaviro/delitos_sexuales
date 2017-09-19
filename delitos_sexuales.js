var margin = {top: 100, right: 200, bottom: 100, left: 200},
    width = 1280 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var x = d3.scaleLinear()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var color = d3.scaleOrdinal(d3.schemeCategory10);

var xAxis = d3.axisBottom(x)

var yAxis = d3.axisLeft(y)

var svg = d3.select("body").append("svg")
    .attr("id", "graph")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/delitos.csv")
  .row(
    function(r) {
      return {
        month: +r.MES,
        day: +r.DIA_NUM,
        crime: r.DELITO,
        date: new Date(2016, +r.MES - 1, +r.DIA_NUM)
      }
    })
  .get(
    function(error, csv_data) {
      console.log(csv_data)

      //Group by date
      var data = d3.nest()
      .key( function(r) {
        return r.date
      })
      .entries(csv_data)
      console.log(data)

      //Get number of crimes in each date
      var nums = []
      data.forEach( function(x) {
        x.num = x.values.length
        nums.push(x.num)
      })
      console.log(data)

      //Axis scales
      x.domain([0,31])
      y.domain([0,12])

      //Color scales
      var max = d3.max(nums);
      var scale = d3.scaleLinear().domain([0, max]).range([0, 1]);

      //X-axis
      svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .style("fill", "#2F2F2F")
      .text("Day");

      //Y-axis
      svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("fill", "#2F2F2F")
      .text("Month");

      //Tooltip div
      var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

      //Dots
      svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", function(r) { return x(r.values.length) * 0.0025; })
      .attr("cx", function(r) { return x(new Date(r.key).getDate()); })
      .attr("cy", function(r) { return y(new Date(r.key).getMonth() + 1); })
      .style("fill", function(r) {return d3.interpolatePurples(scale(r.values.length))})
      // .style("fill", function(r) {return d3.interpolateGreys(-(scale(r.values.length)-1))})

      //Mouse events
      .on("mouseover", function(d, i) {
        d3.selectAll(".dot")
          .transition()
          .duration(200)
          .attr("opacity", function(r, j){
            return j !== i ? 0.3 : 1;
          })
        div.transition()
          .duration(200)
         .style("opacity", .9);
       div.html(formatDate(new Date(d.key)) + "<br/><p>" + d.values.length + " crimes</p>")
         .style("left", (d3.event.pageX + 20) + "px")
         .style("top", (d3.event.pageY - 30) + "px");
       })
     .on("mouseout", function(d) {
       d3.selectAll(".dot")
         .transition()
         .duration(200)
         .attr("opacity", 1);
       div.transition()
         .duration(500)
         .style("opacity", 0);
       });

    }
  )

function formatDate(date) {
  var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ];
  var dayNames = [
    "Mon", "Tue", "Wed",
    "Thu", "Fri", "Sat", "Sun"
  ];
  var dayN = date.getDay();
  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return dayNames[dayN] + ' ' + monthNames[monthIndex] + ' ' + day + ', ' + year;
}
