import React from 'react';
import { ReactMic } from 'react-mic';
import logo from './sous_chef_robot3.svg';
import './App.css';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      answer: null,
      recipe: "",
      question: "",
      record: false,
      recording: null
    };
  }

  submitQuery = (event) => {
    var form = new FormData();
    form.append("recording", this.state.recording.blob)
    form.set("recipe", this.state.recipe)
    form.set("question", this.state.question)

    fetch("/ask", {
        method: "POST",
        body: form
      }
    ).then(response => {
        return response.json()
      }
    ).then(data => {
        this.setState({
          answer: data.answer
        });
      }
    );
  }

  onStop = (recording) => {
    this.setState({
      recording: recording
    });
  }

  onData = (recording) => {
  }

  startRecording = () => {
    this.setState({ record: true });
  }

  stopRecording = () => {
    this.setState({ record: false });
  }

  onChangeRecipe = (event) => {
    this.setState({
      recipe: event.target.value
    });
  }

  onChangeQuestion = (event) => {
    this.setState({
      question: event.target.value
    });
  }

  render() {
    return (
      <div className="App">
        <img src={logo} className="App-logo" alt="logo"/>
        <p className="App-title">Sous Chef</p>
        <p>What's cookin'? (Paste recipe below)</p>
        <textarea name="recipe" value={this.state.recipe} onChange={this.onChangeRecipe} className="recipeBox"/>
        <p className="questionInstructions">Ask away, Chef! (Paste question below)</p>
        <ReactMic
          record={this.state.record}
          onStop={this.onStop}
          onData={this.onData}
          strokeColor="#000000"
          backgroundColor="#FFFFFF"
          className="recorder"/>
        <button onClick={this.startRecording} type="button" className="Button-start">Start</button>
        <button onClick={this.stopRecording} type="button" className="Button-stop">Stop</button>
        <br />
        <input type="text" name="question" value={this.state.question} onChange={this.onChangeQuestion} className="questionBox"/>
        <button onClick={this.submitQuery} className="Button-ask">Ask</button>
        {this.state.answer ? <p className="answer">"{this.state.answer}"</p> : <p></p>}
      </div>
    );
  }
}

export default App;
