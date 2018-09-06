var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var margin = { top: 20, right: 200, bottom: 80, left: 200 },
  width = w - margin.left - margin.right,
  height = h*0.65 - margin.top - margin.bottom;

var x1 = d3.scaleLinear().range([0, width]);

var y1 = d3.scaleLinear().range([height, 0]);

// var color = d3.scaleOrdinal(d3.schemeCategory10);

var xAxis1 = d3.axisBottom(x1);

var yAxis1 = d3.axisLeft(y1);

var svg = d3
  .select(".graph")
  .append("svg")
  .attr("id", "graph")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3
  .csv("data/delitos.csv")
  .row(function(r) {
    return {
      month: +r.MES,
      day: +r.DIA_NUM,
      crime: r.DELITO,
      date: new Date(2016, +r.MES - 1, +r.DIA_NUM)
    };
  })
  .get(function(error, csv_data) {
    console.log(csv_data);

    //Group by date
    var data = d3
      .nest()
      .key(function(r) {
        return r.date;
      })
      .entries(csv_data);
    console.log(data);

    //Get number of crimes in each date
    var nums = [];
    data.forEach(function(x) {
      x.num = x.values.length;
      nums.push(x.num);
    });
    console.log(data);

    //Axis scales
    x1.domain([0, 31]);
    y1.domain([0, 12]);

    //Color scales
    var max = d3.max(nums);
    var scale = d3
      .scaleLinear()
      .domain([0, max])
      .range([0, 1]);

    //X-axis
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis1)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .style("fill", "#2F2F2F")
      .text("Day");

    //Y-axis
    svg
      .append("g")
      .attr("class", "y-axis")
      .call(yAxis1)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("fill", "#2F2F2F")
      .text("Month");

    //Tooltip div
    var div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    //Dots
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", function(r) {
        return x1(r.values.length) * 0.0025;
      })
      .attr("cx", function(r) {
        return x1(new Date(r.key).getDate());
      })
      .attr("cy", function(r) {
        return y1(new Date(r.key).getMonth() + 1);
      })
      .style("fill", function(r) {
        return d3.interpolatePurples(scale(r.values.length));
      })
      // .style("fill", function(r) {return d3.interpolateGreys(-(scale(r.values.length)-1))})

      //Mouse events
      .on("mouseover", function(d, i) {
        d3
          .selectAll(".dot")
          .transition()
          .duration(200)
          .attr("opacity", function(r, j) {
            return j !== i ? 0.3 : 1;
          });
        div
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        div
          .html(
            formatDate(new Date(d.key)) +
              "<br/><p>" +
              d.values.length +
              " crimes</p>"
          )
          .style("left", d3.event.pageX + 20 + "px")
          .style("top", d3.event.pageY - 30 + "px");
      })
      .on("mouseout", function(d) {
        d3
          .selectAll(".dot")
          .transition()
          .duration(200)
          .attr("opacity", 1);
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
      });
  });


function formatDate(date) {
  var monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  var dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var dayN = date.getDay();
  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return (
    dayNames[dayN] + " " + monthNames[monthIndex] + " " + day + ", " + year
  );
}
