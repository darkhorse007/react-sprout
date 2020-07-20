import { ToyReact, Component } from './ToyReact'

class MyComponent extends Component {
  render() {
    const name = 'My-Component'
    return (
      <div data-url="bing.com">
        <h2>Hello, React</h2>
        <h3>{name}</h3>
      </div>
    )
  }
}

const comp = <MyComponent name="hello" id="container" />

ToyReact.render(comp, document.getElementById('app'))
