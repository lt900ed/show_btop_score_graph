function get_tsv_data_for_win_predict(path_data, div_id) {
  $.ajax({
    url: path_data,
    type: 'GET',
    dataType: 'text',
    timeout: 5000,
    success: function(res) {
      var arr = tsv2array(res);
      console.log(arr);
      if (JSON.stringify(window.displayArr) != JSON.stringify(arr[arr.length - 1])) {
        window.displayArr = arr[arr.length - 1];
        var win_prob_rate = arr[arr.length - 1][1];

        if (!window.gauge) {
          var g = new JustGage({
            id: div_id,
            hideMinMax: true,
            value: 50,
            min: 0,
            max: 100,
            valueMinFontSize: 30,
            gaugeWidthScale: 1,
            textRenderer: function (val) {
              return Math.round(val) + '%'
            },
            decimals: 0,
            pointer: true,
            pointerOptions: {
              toplength: 0,
              bottomlength: 10,
              bottomwidth: 8,
              color: '#000'
            },
            valueFontColor: 'white',
            counter: true,
            levelColors: [
              "#ff0000",
              "#ff8800",
              "#ffff00",
              "#0088ff",
              "#0000ff"
            ],
            relativeGaugeSize: true
          });
          window.gauge = g
        }
        window.gauge.refresh(Math.round(win_prob_rate * 100))
      }
    },
    error: function() {
    }
  });
}

function tsv2array(data) {
  const dataArray = [];
  const dataString = data.split('\r\n');
  var tmp_arr;
  for (let i = 0; i < dataString.length; i++) {
    tmp_arr = dataString[i].split('\t');
    if (tmp_arr.length == 2) {
      dataArray[i] = dataString[i].split('\t');
    }
  }
  return dataArray;
}
