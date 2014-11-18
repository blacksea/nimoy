var d3 = require('d3')

  function setupCanvas (e) {  // USER INTERFACE
    var bounds = [window.innerWidth*scale, window.innerHeight*scale]

    var br = 358
    var svgWidth = 388
    var svgHeight = window.innerHeight - 56

    var boxes = null
    var jacks = null
    var dots = null
    var cmd

    document.addEventListener('dragover', cancel, false)
    document.addEventListener('drop', function (e) {
      cancel(e)
      var cmd = e.dataTransfer.getData('cmd')
      if (cmd) s.push(cmd+'/'+opts.id)
      else return false
    })

    _.each(document.querySelectorAll('.lib li'), function (el) {
      el.addEventListener('dragstart', function (e) {
        cmd = '+'+e.target.querySelector('span').innerHTML
        e.dataTransfer.setData('cmd',cmd)
      }, false)
    })

    if (!svg) {
      svg = d3.select('#cvs').append('svg')
              .attr('height', svgHeight)
              .attr('width', svgWidth)

      svg.append('svg:rect')
        .attr('x',15)
        .attr('y',15)
        .attr('width',br)
        .attr('height',bounds[1])
        .attr('fill', 'transparent')
        .attr('stroke','rgba(241,241,241,0.2)')
    } else if (svg) {
      svg.attr('height', svgHeight)
      d3.select('rect')
        .attr('height',bounds[1])
    }

    if (frame) drawBones(frame)
  }

  function drawBones (d) { 
    frame = d

    var canvas = d.value

    d3.selectAll('text').remove()

    for (item in canvas) {
      var center 

      if (document.getElementById(item)) {
        var div = document.getElementById(item).firstChild
        center = [
          ((div.offsetWidth/2) + div.offsetLeft) * scale,
          (((div.offsetHeight/2) + ((div.offsetTop-56))) * scale)+56
        ]
      }

      svg.append('svg:text')
        .text(canvas[item].name.toUpperCase())
        .attr('x',center[0])
        .attr('y',center[1])
        .attr('fill','#f1f1f1')
        .attr('font-size','9px')
    }
  }

