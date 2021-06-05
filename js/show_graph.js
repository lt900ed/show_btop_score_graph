function add_graph(ctx, arr) {
  if (window.myChart) {
    window.myChart.destroy();
  }

  var ally_clr = "rgba(0, 242, 255)"
  var enemy_clr = "rgba(241, 86, 40)"
  var vw = $(window).width();
  var border_width = Math.floor(vw / 80);
  var tick_x_size = Math.floor(vw / 25);
  var tick_y_size = Math.floor(vw / 20);
  var arr_ally = arr.map((i) => {return {x: i[1], y:i[2]}});
  var arr_enemy = arr.map((i) => {return {x: i[1], y:i[3]}});

  window.myChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'ally',
          data: arr_ally,
          borderColor: ally_clr,
          backgroundColor: "rgba(0,0,0,0)",
          borderWidth: border_width,
          pointRadius: 0,
          showLine: true
        },
        {
          label: 'enemy',
          data: arr_enemy,
          borderColor: enemy_clr,
          backgroundColor: "rgba(0,0,0,0)",
          borderWidth: border_width,
          pointRadius: 0,
          showLine: true
        }
      ],
    },
    options: {
      title: {
        display: false
      },
      scales: {
        x: {
          display: true,
          suggestedMin: 0,
          suggestedMax: 480,
          ticks: {
            stepSize: 60,
            callback: function(value, index, values){
              return  value + 's'
            },
            color: "rgba(255, 255, 255 ,1)",
            font: {
              size: tick_x_size
            }
          },
        },
        y: {
          display: true,
          // min: 0,            // 最小値
          // max: 25,           // 最大値
          suggestedMin: 0,
          suggestedMax: 10000,
          ticks: {
            suggestedMin: 0,
            stepSize: 1000,
            callback: function(value, index, values){
              return  Math.floor(value / 1000) + 'K';
            },
            color: "rgba(255, 255, 255 ,1)",
            font: {
              size: tick_y_size
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function step_by_step(ctx, is_ground) {
  window.val.push(window.val[window.val.length - 1] + 1)
  add_graph(ctx, is_ground, window.val);
}

function regularly_update(ctx, is_ground) {
  window.val.push(window.val[window.val.length - 1] + 1)
  add_graph(ctx, is_ground, window.val);
}

function get_csv_data(dataPath, ctx, is_ground) {
  $.ajax({
    url: dataPath,
    type: 'GET',
    dataType: 'text',
    timeout: 5000,
    success:function(res) {
      var arr = csv2array(res);
      var this_game_arr = get_this_game_val(arr);
      var now_score = this_game_arr[this_game_arr.length - 1]
      if (JSON.stringify(window.display_arr) != JSON.stringify(this_game_arr)) {
        window.display_arr = this_game_arr;
        add_graph(ctx, window.display_arr);
        change_score(now_score);
      }
    },
    error:function() {
      alert("ロード失敗");
    }
  });
}

function change_score(now_score) {
  $('#ally-score').text(now_score[2]);
  $('#enemy-score').text(now_score[3]);
}

function get_this_game_val(arr) {
  var index = 0
  arr.forEach(function(row, i) {
    if (i > 0) {
      if (row[0] != arr[i - 1][0]) {
        index = i
      }
    }
  });
  var this_game_arr = arr.slice(index);
  return this_game_arr
}

function csv2array(data) {
  const dataArray = [];
  const dataString = data.split('\r\n');
  var tmp_arr;
  for (let i = 1; i < dataString.length; i++) {
    tmp_arr = dataString[i].split(',');
    if (tmp_arr.length == 4) {
      dataArray[i - 1] = tmp_arr;
    }
  }
  return dataArray;
}
