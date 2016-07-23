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

    
    var apiUrl = appUrl + '/api/newChart/' + chartId;
   // var authUrl = appUrl + '/api/isOwner/' + chartId;
    class Holder extends React.Component {
        constructor() {
            super();
            this.state = {
                title: "",
                options: []
            }
        }
        handleTitleChange(e) {
            this.setState({title: e.target.value});
        }
        handleOptionChange(e) {
            this.setState({options: e.target.value.split(',')});
        }
        submitAjax(sendData) {
            var xhr = new XMLHttpRequest();
            var url = apiUrl;
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onreadystatechange = function () { 
                if (xhr.readyState == 4 && xhr.status == 200) {
                   // var json = JSON.parse(xhr.responseText);
                    var result = JSON.parse(xhr.responseText);
                    if(result.result == "err") {
                        window.alert("Unknown error occurred. Try again later.");
                    } else if(result.result == "noAuth") {
                        window.alert("Make sure you are logged in before creating a poll.");
                    } else {
                        window.location = appUrl + '/chart/' + result.chartId;
                    }
                    //console.log(json.email + ", " + json.password)
                }
            }
            var data = JSON.stringify(sendData);
            xhr.send(data);
        }
        handleSubmit() {
            if(this.state.title && this.state.options.length != 0) {
               this.submitAjax({title: this.state.title, options: this.state.options});
            } else {
                window.alert("Empty title or options are not allowed.");
            }
        }
        
        render() {
            
            return (
            <Jumbotron>
                <div className="someMargin">
                    <h2>Make a new Poll!</h2>
                    <form>
                        <Row>
                            <Col xs={8}>
                            <FormGroup>
                              <label>Title</label>
                              <FormControl type="text" onChange={this.handleTitleChange.bind(this)} />
                             </FormGroup>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col xs={8}>
                                <FormGroup>
                                    <ControlLabel>Options (separated by commas)</ControlLabel>
                                    <FormControl componentClass="textarea" onChange={this.handleOptionChange.bind(this)}/>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Button bsStyle="success" onClick={this.handleSubmit.bind(this)}>
                            Submit
                        </Button>
                    </form>
                </div>
            </Jumbotron>
            ); 
        }
    }
    
    ReactDOM.render(
        <Holder />,
        document.getElementById("main")
    );
    
    
})(); 
