(function ($) {
  $(document).ready(function () {
    var fill_stasis = "0-#0398DE:5-#386296:95";
    var fill_highlighted = "#0398DE";
    var border_color = "#CBD3D9"
    var default_text_color = "#fff";
    var popup_color = "#315886"
    //The html element where the canvas is drawn.
    var R = Raphael("interactive-map", 525, 600);
    var current = null;
    var regions = {};
    var attr = {
      fill:fill_stasis,
      stroke:border_color,
      "stroke-width":0,
      "stroke-linejoin":"round"
    };

    function removeOldState() {
      if (current !== null) {
        var old_text = regions[current]['text'];
        var old_region = regions[current];
        var old_popup = regions[current]['popup'];
        old_text.attr({fill:regions[current].text_color, 'font-size':9});
        old_region.attr({fill:fill_stasis})
        old_popup.remove()
      }
    }

    function drawPopup(text_position) {
      var y_top = (text_position.y - (text_position.height * 0.6 / 2));
      var y_bottom = (text_position.y + (text_position.height * 1.4));
      var x_left = (text_position.x - (text_position.width * 0.4) / 2);
      var x_right = (text_position.x + (text_position.width + (text_position.width * 0.4) / 2));
      var x_triangle_left = x_left + (((x_right - x_left) / 2) - 10);
      var x_triangle_right = (x_triangle_left + 20);
      var x_triangle_center = (x_triangle_left + 10);
      var y_triangle = (y_bottom + 5);
      return R.path("M " + x_left + "," + y_top + " " + x_left + "," + y_bottom + "   " + x_triangle_left + "," + y_bottom + " " + x_triangle_center + "," + y_triangle + " " + x_triangle_right + "," + y_bottom + " " + x_right + "," + y_bottom + " " + x_right + "," + y_top + "  z")
        .attr({fill:"#fff", stroke:"transparent"});
    }

    function mapInteractions(st, state, text) {
      st[0].style.cursor = "pointer";
      st[0].onmouseover = function () {
        if (state !== current) {
          //Unhighlight the old active state
          removeOldState();
          //change the background color to the higlighted color
          st.attr({fill:fill_highlighted});
          //Calculate the popup vector and draw it
          st.popup = drawPopup(text.getBBox());
          //Add the text to the popup
          text.attr({fill:popup_color, 'font-size':12});
          text.toFront();
        }
        R.safari();
        current = state;
      };
      st[0].onclick = function () {
        window.location = 'http://' + document.location.hostname + '/node/' + st.nid
      };
      st.text[0].onclick = function () {
        window.location = 'http://' + document.location.hostname + '/node/' + st.nid
      };

    };

    function correctBbox(bbox, x, y) {
      if (typeof(x) != "undefined" && x !== null) {
        bbox.x = bbox.x + x;
      }
      if (typeof(y) != "undefined" && y !== null) {
        bbox.y = bbox.y + y;
      }
    }

    for (region_data in regions_data) {
      //Collect all the variables from the associative array.
      var name = regions_data[region_data]['name']
      var path = regions_data[region_data]['path']
      var region = new Object();
      var text_color = "";

      //check if there is a text color set for the region, e.g.(sea region)
      if (typeof(regions_data[region_data]['text_color']) != "undefined" && regions_data[region_data]['text_color'] !== null) {
        text_color = regions_data[region_data]['text_color'];
      }
      else {
        text_color = default_text_color;
      }

      //Draw the path for the current region.
      region = R.path(path).attr(attr);

      //Calculate the centroid of the path

      var bbox = region.getBBox();
      // Add correction to the text placing, the default is the centroid of the path, but that is not always acceptable.
      correctBbox(bbox, regions_data[region_data]['textCorrectionX'], regions_data[region_data]['textCorrectionY']);

      //Draw the text using the centroid, to write the name in the center of the region
      region.nid = regions_data[region_data]['nid']
      region.text = R.text(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2, name).attr({'fill':text_color, 'font-size':9, 'font-weight':"bold"});
      region.text_color = text_color;
      region.color = Raphael.getColor();
      region.name = name;
      region[0].style.cursor = "pointer";
      region.text[0].style.cursor = "pointer";
      regions[name] = region;
    }

    for (var state in regions) {
      var text = regions[state]['text'];
      text.toFront();
      // Whe only want to add animation and interaction if the nid is set.
      if (typeof(regions[state]['nid']) != "undefined" && regions[state]['nid'] !== null) {
        mapInteractions(regions[state], state, text);
      }
    }
    var rect_b = R.path("  M13.828,517.93V456.5h130.086H274v61.43v61.426H143.914H13.828V517.93z").attr({'stroke':popup_color});
  });
})(jQuery);
