import { ToyReact, Component } from './ToyReact'

class MyComponent extends Component {
  render() {
    return <div>Hello, React</div>
  }
}

const comp = <MyComponent name="hello" id="container" />

ToyReact.render(comp, document.getElementById('app'))
