import React, { Component } from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import BooleanInput from "../inputs/BooleanInput";

export default class BoxColliderNodeEditor extends Component {
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object
  };

  static iconClassName = "fa-hand-paper";

  onChangeWalkable = walkable => {
    this.props.editor.setNodeProperty(this.props.node, "walkable", walkable);
  };

  render() {
    return (
      <NodeEditor
        {...this.props}
        description="An invisible box that objects will bounce off of or rest on top of.\nWithout colliders, objects will fall through floors and go through walls."
      >
        <InputGroup name="Walkable">
          <BooleanInput value={this.props.node.walkable} onChange={this.onChangeWalkable} />
        </InputGroup>
      </NodeEditor>
    );
  }
}
