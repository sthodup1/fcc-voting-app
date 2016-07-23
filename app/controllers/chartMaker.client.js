'use strict';

// Creates the page with the chart in it

'use strict';

(function(){
    var Jumbotron = ReactBootstrap.Jumbotron;
    var Grid = ReactBootstrap.Grid;
    var Row = ReactBootstrap.Row;
    var Col = ReactBootstrap.Col;
    var FormGroup = ReactBootstrap.FormGroup;
    var FormControl = ReactBootstrap.FormControl;
    var ControlLabel = ReactBootstrap.ControlLabel;
    var Button = ReactBootstrap.Button;

    
    var apiUrl = appUrl + '/api/chart/' + chartId;
    var authUrl = appUrl + '/api/isOwner/' + chartId;
    class Holder extends React.Component {
        constructor() {
            super();
            this.state = {
                chartOwner: "",
                chartTitle: "", 
                dataRows: [],
                choices: [],
                choice: "",
                deleteButton: "",
                customOption: false
            };
        }
        componentDidMount() {
            // Load the Visualization API and the corechart package.
            google.charts.load('current', {'packages':['corechart']});
            this.runAjax();
        }
        
        runAjax() {
            ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET',apiUrl, function(data) {
                var chartData = JSON.parse(data)[0];
                var dataRows = [];
                var choices = [];
                Object.keys(chartData.data).forEach(function(key) {
                    dataRows.push([key, chartData.data[key]]);
                    choices.push(key);
                });
                // Gives a default choices in case user hit submit without
                // opening up the dropdown
                this.setState({
                    chartTitle: chartData.title,
                    dataRows: dataRows,
                    choices: choices,
                    choice: choices[0],
                });
                ajaxFunctions.ajaxRequest('GET', appUrl + '/api/isAuth', function(data) {
                    if(JSON.parse(data).auth) {
                        var newChoices = this.state.choices;
                        newChoices.push("I'd like to choose a custom option");
                        this.setState({choices: newChoices});
                    }
                }.bind(this));
            }.bind(this)));
            
            ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl + '/owner/isOwner', function(data) {
                var result = JSON.parse(data).result;// || true;
                if(result) {
                    this.setState({
                        deleteButton : <Button bsStyle="danger" onClick={this.handleDelete.bind(this)}>
                                  Delete
                                </Button>});
                }
            }.bind(this)));
        }
        generateChoices(choices) {
            var count = 1;
            var toReturn = choices.map(function(item) {
                return (
                    <option key={count++} value={item}>{item}</option>
                    );
            }.bind(this));
            return toReturn;
        }
        handleChange(e) {
            this.setState({choice: e.target.value});
            if(e.target.value == "I'd like to choose a custom option"){
                this.setState({customOption : true, choice : ""});
            }
        }
        generateCustomOption() {
            if(this.state.customOption) {
                return(
                    <FormGroup>
                      <label>Enter custom option</label>
                      <FormControl type="text" onChange={this.handleChange.bind(this)} />
                    </FormGroup>
                    );
            } else {
                return "";
            }
        }
        handleSubmit() {
            ajaxFunctions.ajaxRequest('POST', apiUrl + "/" + this.state.choice, function(data) {
                var result = JSON.parse(data).result;
                if(result == "success") {
                    this.setState({customOption : false});
                    this.runAjax();
                } else if(result == "err") {
                    window.alert("Unknown error occurred. Try again later.");
                } else if(result == "noChart") {
                    window.alert("The requested chart does not exist.");
                } else if(result == "noChoice") {
                    window.alert("The requested choice does not exist.");
                } else if(result == "noVote") {
                    window.alert("User or IP already voted on this chart.");
                } else {
                    window.alert("Unknown error. Contact website creator.");
            }
            }.bind(this));
        }
        handleDelete() {
            ajaxFunctions.ajaxRequest('DELETE', apiUrl, function(data) {
                var result = JSON.parse(data).result;
                if(result == "success") {
                    window.location = "/";
                } else if(result == "err") {
                    window.alert("Unkown error occurred. Try again later.")
                } else if (result == "noChart") {
                    window.alert("Requested chart does not exist.");
                } else if(result == "noAuth") {
                    window.alert("User is not logged in or is not the creator of this chart.")
                }
            })
            
        }
        render() {
            var dataRows = this.state.dataRows;
            var choices = this.state.choices;

            if(dataRows.length > 0) {
                // Set a callback to run when the Google Visualization API is loaded.
                google.charts.setOnLoadCallback(drawChart.bind(this));
            
                //   Callback that creates and populates a data table,
                //   instantiates the pie chart, passes in the data and
                //   draws it.
                function drawChart() {
            
                    // Create the data table.
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'Option');
                    data.addColumn('number', 'Votes');
                    data.addRows(dataRows);
            
                    // Set chart options
                    var options = {'width':660,
                                  'height':495,
                                  'backgroundColor': 'transparent',
                    };
            
                    // Instantiate and draw our chart, passing in some options.
                    var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
                    chart.draw(data, options);
                  }
            }
            // Inspired by the example on fcc
            return (
            <Jumbotron>
                <Grid>
                    <Row>
                        <Col xs={5}>
                            <h2>{this.state.chartTitle}</h2>
                            <form>
                                <FormGroup controlId="formControlsSelect">
                                    <ControlLabel>I'd like to vote for...</ControlLabel>
                                    <FormControl componentClass="select" placeholder="..." onChange={this.handleChange.bind(this)}>
                                        {this.generateChoices(choices)}
                                    </FormControl>
                                </FormGroup>
                                {this.generateCustomOption()}
                                
                                <Button bsStyle="success" onClick={this.handleSubmit.bind(this)}>
                                  Submit
                                </Button>

                                <a className="btn btn-twitter" href="https://twitter.com/share" target="_blank">
                                    <span className="fa fa-twitter"></span> Share
                                </a>
                                {this.state.deleteButton}
  
                            </form>
                        </Col>
                        

                        
                        <Col xs={7}>
                            <div id="chart_div" />
                        </Col>
                        
                    </Row>

                
                </Grid>
            </Jumbotron>
            ); 
        }
    }
    
    ReactDOM.render(
        <Holder />,
        document.getElementById("main")
    );
    
    
})(); 
