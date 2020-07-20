class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
  appendChild(vchild) {
    vchild.mountTo(this.root)
  }
  mountTo(parent) {
    parent.appendChild(this.root)
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
  mountTo(parent) {
    parent.appendChild(this.root)
  }
}

export class Component {
  constructor() {
    this.children = []
  }
  setAttribute(name, value) {
    this[name] = value
  }
  mountTo(parent) {
    const vdom = this.render()
    vdom.mountTo(parent)
  }
  appendChild(child) {
    this.children.push(child)
  }
}

export const ToyReact = {
  createElement(type, attrs, ...children) {
    let elem
    const insertChildren = (children) => {
      for (let child of children) {
        if (typeof child === 'object' && child instanceof Array) {
          insertChildren(child)
        } else {
          if (!(child instanceof Component) && !(child instanceof ElementWrapper) && !(child instanceof TextWrapper)) {
            child = String(child)
          }

          if (typeof child === 'string') {
            child = new TextWrapper(child)
          }

          elem.appendChild(child)
        }
      }
    }

    if (typeof type === 'string') {
      elem = new ElementWrapper(type)
    } else {
      elem = new type()
    }
    for (let key in attrs) {
      elem.setAttribute(key, attrs[key])
    }
    /*
    for (let child of children) {
      if (typeof child === 'string') {
        child = new TextWrapper(child)
      }
      elem.appendChild(child)
    }
    */
    insertChildren(children)
    return elem
  },
  render(vnode, element) {
    // element.appendChild(vnode)
    vnode.mountTo(element)
  }
}
