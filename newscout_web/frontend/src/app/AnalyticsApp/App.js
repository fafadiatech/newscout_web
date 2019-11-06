import React from 'react';
import Chart from "react-apexcharts";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      options: {
        chart: {
          id: "basic-bar"
        },
        xaxis: {
          categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
        },
        title: {
          text: "Line with Annotations",
          align: "center"
        },
      },
      series: [
        {
          name: "series-1",
          data: [30, 40, 45, 50, 49, 60, 70, 91]
        }
      ]
    };
  }

 loadTSData = (fileName, skipItems) => {
   var URL = `/static/js/react/${fileName}`;
   var ts = [];
   var counts = [];
   fetch(URL)
    .then(response => response.json())
    .then(data => {
      for(var current in data){
        var row = data[current];

        if(skipItems.indexOf(row.ts) != -1){
          continue;  
        }

        ts.push(row.ts);
        counts.push(row.count);
      }
    });
    return({ts: ts.reverse(), counts: counts.reverse()});
 }

  tsChart = (fileName, title, chartType="bar", skipItems=[], showLabels=false) => {
    var tsData = this.loadTSData(fileName, skipItems);
    var options = {
      chart: {
        id: "basic-bar"
      },
      xaxis: {
        categories: tsData.ts
      },
      title: {
        text: title,
        align: "center"
      },
      dataLabels: {
        enabled: {showLabels}
      }      
    };

    var series = [
      {
        name: "series-1",
        data: tsData.counts
      }
    ];

    return(
      <Chart
      options={options}
      series={series}
      type={chartType}
      width="800"
      />
    );
  }

  render(){
    return(
      <div className="App">
        <nav className="navbar fixed-top navbar-expand-sm navbar-dark bg-dark">
          <div className="inner-section">
            <img className="logo" src="/static/images/logo/logo.jpg" alt="logo" />
          </div>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
        </nav>
        <br />
        <div className="row" >
          <div className="col-md-6 mt-5">
            {this.tsChart('articles_7_days.json', 'Articles: Last 7 days', "bar", [], true)}
          </div>
          <div className="col-md-6 mt-5">
            {this.tsChart('articles_30_days.json', 'Articles: Last 30 days')}
          </div>
        </div>
        <div className="row" >        
          <div className="col-md-6 mt-5">
            {this.tsChart('source_count_categorized.json', 'Source Counts: Categorized')}
          </div>
          <div className="col-md-6 mt-5">
            {this.tsChart('source_count_uncategorized.json', 'Source Counts: Un-Categorized')}
          </div>
        </div>
        <div className="row" >
          <div className="col-md-6 mt-5">
            {this.tsChart('category_distribution_weekly.json', 'Category Counts: Weekly', "bar", ["Uncategorised", "Uncategorized"])}
          </div>
          <div className="col-md-6 mt-5">
            {this.tsChart('category_distribution.json', 'Category Counts: All-time')}
          </div>
        </div>
        <div className="row" >
          <div className="col-md-6 mt-5">
            {this.tsChart('category_distribution_monthly.json', 'Category Counts: Months', "bar", ["Uncategorised", "Uncategorized"])}
          </div>
          <div className="col-md-6 mt-5">
          </div>
        </div>
      </div>
    );
  }
}

export default App;
