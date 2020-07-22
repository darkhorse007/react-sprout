class ElementWrapper {
  constructor(type) {
    //this.root = document.createElement(type)
    this.type = type
    this.props = Object.create(null)
    this.children = []
  }
  setAttribute(name, value) {
    // if (name.match(/^on([\s\S]+)$/)) {
    //   const evtName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase())
    //   this.root.addEventListener(evtName, value)
    // }
    // if (name === 'className') {
    //   name = 'class'
    // }
    // this.root.setAttribute(name, value)
    this.props[name] = value
  }
  get vdom() {
    const { type, props } = this
    return {
      type,
      props,
      children: this.children.map((c) => c.vdom)
    }
  }
  appendChild(vchild) {
    // const range = document.createRange()
    // if (this.root.children.length) {
    //   range.setStartAfter(this.root.lastChild)
    //   range.setEndAfter(this.root.lastChild)
    // } else {
    //   range.setStart(this.root, 0)
    //   range.setEnd(this.root, 0)
    // }
    // vchild.mountTo(range)
    this.children.push(vchild)
  }
  mountTo(range) {
    this.range = range
    const elem = document.createElement(this.type)
    for (let name in this.props) {
      const value = this.props[name]
      if (name.match(/^on([\s\S]+)$/)) {
        const evtName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase())
        elem.addEventListener(evtName, value)
      }
      if (name === 'className') {
        elem.setAttribute('class', value)
      }
      elem.setAttribute(name, value)
    }

    for (let child of this.children) {
      const range = document.createRange()
      if (elem.children.length) {
        range.setStartAfter(elem.lastChild)
        range.setEndAfter(elem.lastChild)
      } else {
        range.setStart(elem, 0)
        range.setEnd(elem, 0)
      }
      child.mountTo(range)
    }

    //range.deleteContents()
    range.insertNode(elem)
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
    this.type = '#text'
    this.children = []
    this.props = Object.create(null)
  }
  get vdom() {
    return {
      type: '#text',
      props: this.props,
      children: []
    }
  }
  mountTo(range) {
    this.range = range
    range.deleteContents()
    range.insertNode(this.root)
  }
}

export class Component {
  constructor() {
    this.children = []
    this.props = Object.create(null)
  }
  get type() {
    return this.constructor.name
  }
  setAttribute(name, value) {
    this[name] = value
    this.props[name] = value
  }
  mountTo(range) {
    this.range = range
    this.update()
  }
  update() {
    const vdom = this.render()
    const isSameNode = (node1, node2) => {
      if (node1.type !== node2.type) {
        return false
      }
      for (let p in node1.props) {
        if (
          typeof node1.props[p] === 'function' &&
          typeof node2.props[p] === 'function' &&
          node1.props[p].toString() === node2.props[p].toString()
        ) {
          continue
        }
        if (
          typeof node1.props[p] === 'object' &&
          typeof node2.props[p] === 'object' &&
          JSON.stringify(node1.props[p]) === JSON.stringify(node2.props[p])
        ) {
          continue
        }
        if (node1.props[p] !== node2.props[p]) {
          return false
        }
      }
      if (Object.keys(node1.props).length !== Object.keys(node2.props).length) {
        return false
      }
      return true
    }
    const isSameTree = (node1, node2) => {
      if (!isSameNode(node1, node2)) {
        return false
      }
      if (node1.children.length !== node2.children.length) {
        return false
      }
      for (let i = 0; i < node1.children.length; i++) {
        if (!isSameTree(node1.children[i], node2.children[i])) {
          return false
        }
      }
      return true
    }
    const replace = (newTree, oldTree) => {
      if (isSameTree(newTree, oldTree)) {
        return
      }
      if (!isSameNode(newTree, oldTree)) {
        newTree.mountTo(oldTree.range)
      } else {
        for (let i = 0; i < newTree.children.length; i++) {
          replace(newTree.children[i], oldTree.children[i])
        }
      }
    }
    if (this.vdom) {
      if (isSameTree(vdom, this.vdom)) {
        return
      }

      replace(vdom, this.vdom)
    } else {
      vdom.mountTo(this.range)
    }
    this.vdom = vdom
  }
  appendChild(vchild) {
    this.children.push(vchild)
  }
  setState(state) {
    const merge = (oldState, newState) => {
      for (let p in newState) {
        if (typeof newState[p] === 'object' && newState[p] !== null) {
          if (typeof oldState[p] !== 'object') {
            if (newState[p] instanceof Array) {
              oldState[p] = []
            } else {
              oldState[p] = {}
            }
          }
          merge(oldState[p], newState[p])
        } else {
          oldState[p] = newState[p]
        }
      }
    }
    if (!this.state && state) {
      this.state = {}
    }
    merge(this.state, state)
    this.update()
  }
}

export const ToyReact = {
  get vdom() {
    return this.render().vdom
  },
  createElement(type, attrs, ...children) {
    let elem
    const insertChildren = (children) => {
      for (let child of children) {
        if (typeof child === 'object' && child instanceof Array) {
          insertChildren(child)
        } else {
          if (child === null || child === void 0) {
            child = ''
          }
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
    insertChildren(children)
    return elem
  },
  render(vdom, element) {
    // element.appendChild(vnode)
    // vnode.mountTo(element)
    const range = document.createRange()
    if (element.children && element.children.length) {
      range.setStartAfter(element.lastChild)
      range.setEndAfter(element.lastChild)
    } else {
      range.setStart(element, 0)
      range.setEnd(element, 0)
    }
    vdom.mountTo(range)
  }
}
