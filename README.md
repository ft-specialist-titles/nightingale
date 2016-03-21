Nightingale  [![Circle CI](https://circleci.com/gh/ft-specialist-titles/nightingale/tree/master.svg?style=svg)](https://circleci.com/gh/ft-specialist-titles/nightingale/tree/master)
========================
> A tool for journalists to create IC and FTA styled charts

## How to make a chart

* Source data in CSV or TSV format. You can also copy a range of cells from Excel.
* Drag and drop or paste the data file into [Nightingale](http://st-charts.ft.com/)
* Nightingale will try to guess the data type of each column and configure the axes
* Give the chart a title, subtitle and source line. A great title is crucial. The subtitle should be descriptive of the data show in the chart.
* Correct the configured axes if Nightingale didn't automatically do what you wanted
* Click the chart that you want for your article
* Click the big blue button to download the image

For help and suport send Sumeet an [email](mailto:sumeet.adur@ft.com) or add an issue on [github](https://github.com/ft-specialist-titles/nightingale/issues/new).

## Limitiations

* The background colour is fixed as pink. This is a forced limitation for now and we'll remove it once other things improve. It 's mainly due to this pink being the best preference for *all* use cases. 
* Requires the latest version of Chrome, Firefox or IE. We are never going to support older browsers.

## Contribute to Nightingale

[See the contributing docs](CONTRIBUTING.md).

## Things we've used to make this

* [D3](https://github.com/mbostock/d3/wiki/API-Reference)
* [Backbone](http://backbonejs.org/) (plus jQuery and underscore)
* [Backbone.stickit](https://github.com/NYTimes/backbone.stickit)
* [o-charts](https://github.com/ft-interactive/o-charts) (Nightingale's sister project)
* [ft-specialist-titles/o-charts](https://github.com/ft-specialist-titles/o-charts)
* [Bootstrap](http://getbootstrap.com/)
