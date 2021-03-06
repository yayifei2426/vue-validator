/* @flow */
import { looseEqual } from '../util'

export default class SingleElement {
  _vm: Component
  _vnode: any
  initValue: any
  constructor (vm: Component, vnode: any) {
    this._vm = vm
    this._vnode = vnode
    this.initValue = this.getValue()
  }

  get isBuiltIn (): boolean {
    const vnode = this._vnode
    return !vnode.child &&
      !vnode.componentOptions &&
      vnode.tag
  }

  get isComponent (): boolean {
    const vnode = this._vnode
    return vnode.child &&
      vnode.componentOptions &&
      vnode.tag.match(/vue-component/)
  }

  getValue (): any {
    if (this.isBuiltIn) {
      const el = this._vm.$el
      if (el.tagName === 'SELECT') {
        return getSelectValue(el)
      } else {
        if (el.type === 'checkbox') {
          return el.checked
        } else {
          return el.value
        }
      }
    } else if (this.isComponent) {
      return this._vnode.child.value
    } else {
      // TODO: should be warn !!
      return ''
    }
  }

  checkModified (): boolean {
    if (this.isBuiltIn) {
      const el = this._vm.$el
      if (el.tagName === 'SELECT') {
        return !looseEqual(this.initValue, getSelectValue(el))
      } else {
        if (el.type === 'checkbox') {
          return !looseEqual(this.initValue, el.checked)
        } else {
          return !looseEqual(this.initValue, el.value)
        }
      }
    } else if (this.isComponent) {
      return !looseEqual(this.initValue, this._vnode.child.value)
    } else {
      // TODO: should be warn !!
      return false
    }
  }

  listenToucheableEvent () {
    this._vm.$el.addEventListener('focusout', this._vm.willUpdateTouched)
  }

  unlistenToucheableEvent () {
    this._vm.$el.removeEventListener('focusout', this._vm.willUpdateTouched)
  }
}

function getSelectValue (el): Array<any> {
  const value: Array<any> = []
  for (let i = 0, l = el.options.length; i < l; i++) {
    const option = el.options[i]
    if (!option.disabled && option.selected) {
      value.push(option.value)
    }
  }
  return value
}
