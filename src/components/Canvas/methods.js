var d3 = require('d3');
export default {
    // handle a click on the canvas
    addPoint (e) {
        // subtract min % spacing to account for grid rounding offsets created by adjusted minimums
        const xAdjustment = this.min_x % this.x_spacing,
            yAdjustment = this.min_y % this.y_spacing;

        // obtain RWU coordinates of click event
        var x = this.scaleX(e.offsetX),
            y = this.scaleY(e.offsetY);

        // round point to nearest gridline, account for the offset created by setting a min_x/min_y
        x = round(this.scaleX(e.offsetX) - xAdjustment, this.x_spacing) + xAdjustment;
        y = round(this.scaleY(e.offsetY) - yAdjustment, this.y_spacing) + yAdjustment;

        if (this.currentMode === 'Rectangle' && this.points.length) {
            // close the rectangle
            this.$store.dispatch('geometry/createFaceFromPoints', {
                points: [
                    { x: this.points[0].x, y: this.points[0].y },
                    { x: x, y: this.points[0].y },
                    { x: x, y: y },
                    { x: this.points[0].x, y: y }
                ]
            });
            this.points = [];
        } else if (this.currentMode === 'Rectangle' || this.currentMode === 'Polygon') {
            // the point is stored in RWU
            this.points.push({ x: x, y: y });
        }

        function round (point, spacing) {
            if (point % spacing < spacing / 2) {
                return point - (point % spacing);
            } else {
                return point + spacing - (point % spacing);
            }
        }
    },

    drawPoints () {
        d3.selectAll("#canvas ellipse").remove();
        // draw new points
        d3.select('#canvas svg')
            .selectAll('ellipse').data(this.points)
            .enter().append('ellipse')
            .attr('cx', (d, i) => { return d.x; })
            .attr('cy', (d, i) => { return d.y; })
            .attr('rx', this.scaleX(2) - this.min_x)
            .attr('ry', this.scaleY(2) - this.min_y)
            .attr('vector-effect', 'non-scaling-stroke');

        // connect the points with a guideline
        this.drawPolygonEdges();

        // set a click listener for the first point in the polynomial, when it is clicked close the shape
        d3.select('#canvas svg').select('ellipse')
            .on('click', () => {
                // create the polygon - triggers this.drawPolygons()
                // create a face in the data store from the points
                this.$store.dispatch('geometry/createFaceFromPoints', {
                    points: this.points
                });

                // clear points, prevent a new point from being created by this click event
                d3.event.stopPropagation();
                this.points = [];
            })
            .attr('rx', this.scaleX(7) - this.min_x)
            .attr('ry', this.scaleY(7) - this.min_y)
            .classed('origin', true) // apply custom CSS for origin of polygons
            .attr('vector-effect', 'non-scaling-stroke');
    },
    drawPolygonEdges () {
        // remove expired paths
        d3.selectAll("#canvas path").remove();

        var line = d3.line()
            .x((d) => { return d.x; })
            .y((d) => { return d.y; });

        d3.select('#canvas svg').append("path")
            .datum(this.points)
            .attr("fill", "none")
            .attr('vector-effect', 'non-scaling-stroke')
            .attr("d", line)
            // prevent overlapping the points - screws up click events
            .lower();

        // keep grid lines under polygon edges
        d3.selectAll('.vertical, .horizontal').lower();
    },
    drawPolygons () {
        // destroy old polygons
        d3.select('#canvas svg').selectAll('polygon').remove();
        // draw a polygon for each space
        d3.select('#canvas svg').selectAll('polygon')
            .data(this.polygons).enter()
            .append('polygon')
            .attr('points', (d, i) => {
                var pointsString = "";
                d.points.forEach((p) => {
                    pointsString += (p.x + ',' + p.y + ' ');
                });
                return pointsString;
            })
            .attr('class', (d, i) => {
                return d.face_id === this.currentSpace.face_id ? "currentSpace" : "null";
            })
            .attr('vector-effect', 'non-scaling-stroke');

        //remove expired points and guidelines
        d3.selectAll("#canvas path").remove();
        d3.selectAll('#canvas ellipse').remove();
    },
    drawGrid () {
        // update scales with new grid boundaries
        this.$store.dispatch('application/setScaleX', {
            scaleX: d3.scaleLinear()
                .domain([0, this.$refs.grid.clientWidth])
                .range([this.min_x, this.max_x])
        });

        this.$store.dispatch('application/setScaleY', {
            scaleY: d3.scaleLinear()
                .domain([0, this.$refs.grid.clientHeight])
                .range([this.min_y, this.max_y])
        });

        // redraw the grid
        var svg = d3.select('#canvas svg');
        svg.selectAll('line').remove();

        // lines are drawn in RWU
        svg.selectAll('.vertical')
            .data(d3.range(this.min_x / this.x_spacing, this.max_x / this.x_spacing))
            .enter().append('line')
            .attr('x1', (d) => { return d * this.x_spacing; })
            .attr('x2', (d) => { return d * this.x_spacing; })
            .attr('y1', this.min_y)
            .attr('y2', this.scaleY(this.$refs.grid.clientHeight))
            .attr('class', 'vertical')
            .attr('vector-effect', 'non-scaling-stroke');

        svg.selectAll('.horizontal')
            .data(d3.range(this.min_y / this.y_spacing, this.max_y / this.y_spacing))
            .enter().append('line')
            .attr('x1', this.min_x)
            .attr('x2', this.scaleX(this.$refs.grid.clientWidth))
            .attr('y1', (d) => { return d * this.y_spacing; })
            .attr('y2', (d) => { return d * this.y_spacing; })
            .attr('class', 'horizontal')
            .attr('vector-effect', 'non-scaling-stroke');

        d3.selectAll('.vertical, .horizontal').lower();
    }
}
// drawRects: function(e) {
//     d3.select('#canvas svg').selectAll('rect')
//         .data(this.rects).enter()
//         .append('rect')
//         .attr('x', (d, i) => {
//             return d.origin.x;
//         })
//         .attr('y', (d, i) => {
//             return d.origin.y;
//         })
//         .attr('width', (d, i) => {
//             return d.size.width;
//         })
//         .attr('height', (d, i) => {
//             return d.size.height;
//         });
// }
