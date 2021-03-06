import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { withSettings } from "../contexts/SettingsContext";
import { withEditor } from "../contexts/EditorContext";
import { withDialog } from "../contexts/DialogContext";
import ButtonSelectDialog from "../dialogs/ButtonSelectDialog";
import AddModelDialog from "../dialogs/AddModelDialog";
import AddMediaDialog from "../dialogs/AddMediaDialog";
import ProgressDialog from "../dialogs/ProgressDialog";
import ErrorDialog from "../dialogs/ErrorDialog";
import styles from "./AddNodeActionButtons.scss";

import GroupNode from "../../editor/nodes/GroupNode";
import GroupNodeEditor from "../properties/GroupNodeEditor";
import ModelNode from "../../editor/nodes/ModelNode";
import ModelNodeEditor from "../properties/ModelNodeEditor";
import BoxColliderNodeEditor from "../properties/BoxColliderNodeEditor";
import BoxColliderNode from "../../editor/nodes/BoxColliderNode";
import GroundPlaneNodeEditor from "../properties/GroundPlaneNodeEditor";
import GroundPlaneNode from "../../editor/nodes/GroundPlaneNode";
import SpawnPointNodeEditor from "../properties/SpawnPointNodeEditor";
import SpawnPointNode from "../../editor/nodes/SpawnPointNode";
import AmbientLightNode from "../../editor/nodes/AmbientLightNode";
import AmbientLightNodeEditor from "../properties/AmbientLightNodeEditor";
import DirectionalLightNode from "../../editor/nodes/DirectionalLightNode";
import DirectionalLightNodeEditor from "../properties/DirectionalLightNodeEditor";
import HemisphereLightNode from "../../editor/nodes/HemisphereLightNode";
import HemisphereLightNodeEditor from "../properties/HemisphereLightNodeEditor";
import SpotLightNode from "../../editor/nodes/SpotLightNode";
import SpotLightNodeEditor from "../properties/SpotLightNodeEditor";
import PointLightNode from "../../editor/nodes/PointLightNode";
import PointLightNodeEditor from "../properties/PointLightNodeEditor";
import SkyboxNode from "../../editor/nodes/SkyboxNode";
import SkyboxNodeEditor from "../properties/SkyboxNodeEditor";
import ImageNode from "../../editor/nodes/ImageNode";
import ImageNodeEditor from "../properties/ImageNodeEditor";
import VideoNode from "../../editor/nodes/VideoNode";
import VideoNodeEditor from "../properties/VideoNodeEditor";
import SpawnerNode from "../../editor/nodes/SpawnerNode";
import SpawnerNodeEditor from "../properties/SpawnerNodeEditor";
import FloorPlanNode from "../../editor/nodes/FloorPlanNode";
import FloorPlanNodeEditor from "../properties/FloorPlanNodeEditor";
import TriggerVolumeNode from "../../editor/nodes/TriggerVolumeNode";
import TriggerVolumeNodeEditor from "../properties/TriggerVolumeNodeEditor";
import LinkNode from "../../editor/nodes/LinkNode";
import LinkNodeEditor from "../properties/LinkNodeEditor";

function AddButton({ label, iconClassName, onClick }) {
  return (
    <div className={styles.addButton}>
      <label>{label}</label>
      <button onClick={onClick}>
        <i className={classNames("fas", iconClassName)} />
      </button>
    </div>
  );
}

AddButton.propTypes = {
  label: PropTypes.string.isRequired,
  iconClassName: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};

class AddNodeActionButtons extends Component {
  static propTypes = {
    editor: PropTypes.object,
    showDialog: PropTypes.func,
    hideDialog: PropTypes.func,
    settings: PropTypes.object
  };

  toggle = () => {
    this.setState({ open: !this.state.open });
  };

  addNode = NodeConstructor => {
    const node = new NodeConstructor(this.props.editor);
    this.props.editor.addObject(node);
    this.setState({ open: false });
  };

  addModel = () => {
    this.props.showDialog(AddModelDialog, {
      title: "Add Model",
      message: "Enter the URL to a Sketchfab model, a Poly model, or a GLTF/GLB file.",
      onConfirm: async (uri, name) => {
        const overrideName = name;

        this.props.showDialog(ProgressDialog, {
          title: "Loading Model",
          message: `Loading Model...`
        });

        try {
          const node = new ModelNode(this.props.editor);
          await node.load(uri);
          node.name = overrideName || node.model.name || "Model";

          this.props.editor.addObject(node);
          this.props.hideDialog();
        } catch (e) {
          let message = e.message || "There was an unknown error.";

          if (uri.indexOf("sketchfab.com") >= 0) {
            message =
              "Error adding model.\n\nNote: Sketchfab models must be marked as 'Downloadable' to be added to your scene.\n\nError: " +
              e.message;
          } else if (uri.indexOf("poly.google.com") >= 0) {
            message =
              "Error adding model.\n\nNote: Poly panoramas are not supported and 3D models must be GLTF 2.0.\n\nError: " +
              e.message;
          }

          console.error(e);
          this.props.showDialog(ErrorDialog, {
            title: "Error Loading Model",
            message
          });
        }
      },
      onCancel: this.props.hideDialog,
      showDialog: this.props.showDialog,
      hideDialog: this.props.hideDialog
    });

    this.setState({ open: false });
  };

  addMedia = () => {
    this.props.showDialog(ButtonSelectDialog, {
      title: "Add Media",
      message: "Choose the type of media to add.",
      options: [
        {
          value: ImageNode,
          iconClassName: ImageNodeEditor.iconClassName,
          label: ImageNode.nodeName
        },
        {
          value: VideoNode,
          iconClassName: VideoNodeEditor.iconClassName,
          label: VideoNode.nodeName
        },
        {
          value: LinkNode,
          iconClassName: LinkNodeEditor.iconClassName,
          label: LinkNode.nodeName
        }
      ],
      onSelect: MediaNode => {
        this.props.showDialog(AddMediaDialog, {
          title: "Add Media",
          message: `Enter the URL for the ${MediaNode.nodeName.toLowerCase()}.`,
          onConfirm: async url => {
            this.props.showDialog(ProgressDialog, {
              title: "Loading Media",
              message: `Loading media...`
            });
            try {
              const media = new MediaNode(this.props.editor);

              if (media.load) {
                await media.load(url);
              } else {
                media.href = url;
              }

              this.props.editor.addObject(media);
              this.props.hideDialog();
            } catch (e) {
              console.error(e);
              this.props.showDialog(ErrorDialog, {
                title: "Error Loading Media",
                message: e.message || "There was an unknown error."
              });
            }
          },
          onCancel: this.props.hideDialog
        });
      },
      onCancel: this.props.hideDialog
    });
    this.setState({ open: false });
  };

  addSpawner = () => {
    this.props.showDialog(AddMediaDialog, {
      title: "Add Spawner",
      message: "Enter the URL to a glTF model.",
      onConfirm: async url => {
        this.props.showDialog(ProgressDialog, {
          title: "Loading Model",
          message: `Loading model...`
        });
        try {
          const contentType = await this.props.editor.project.getContentType(url);

          if (contentType.startsWith("model/")) {
            const spawner = new SpawnerNode(this.props.editor);
            await spawner.load(url);
            this.props.editor.addObject(spawner);
          }

          this.props.hideDialog();
        } catch (e) {
          console.error(e);
          this.props.showDialog(ErrorDialog, {
            title: "Error Loading Model",
            message: e.message || "There was an unknown error."
          });
        }
      },
      onCancel: this.props.hideDialog
    });
    this.setState({ open: false });
  };

  addLight = () => {
    const hasAmbientLight = !!this.props.editor.scene.findNodeByType(AmbientLightNode);
    const hasHemisphereLight = !!this.props.editor.scene.findNodeByType(HemisphereLightNode);

    const options = [
      {
        value: DirectionalLightNode,
        iconClassName: DirectionalLightNodeEditor.iconClassName,
        label: DirectionalLightNode.nodeName
      },

      {
        value: PointLightNode,
        iconClassName: PointLightNodeEditor.iconClassName,
        label: PointLightNode.nodeName
      },
      {
        value: SpotLightNode,
        iconClassName: SpotLightNodeEditor.iconClassName,
        label: SpotLightNode.nodeName
      }
    ];

    if (!hasHemisphereLight) {
      options.unshift({
        value: HemisphereLightNode,
        iconClassName: HemisphereLightNodeEditor.iconClassName,
        label: HemisphereLightNode.nodeName
      });
    }

    if (!hasAmbientLight) {
      options.unshift({
        value: AmbientLightNode,
        iconClassName: AmbientLightNodeEditor.iconClassName,
        label: AmbientLightNode.nodeName
      });
    }

    this.props.showDialog(ButtonSelectDialog, {
      title: "Add Light",
      message: "Choose the type of light to add.",
      options,
      onSelect: value => {
        this.addNode(value);
        this.props.hideDialog();
      },
      onCancel: this.props.hideDialog
    });
    this.setState({ open: false });
  };

  constructor(props) {
    super(props);
    this.props.editor.signals.sceneGraphChanged.add(this.updateSingletonState);
    this.state = {
      open: true,
      ...this.getSingletonNodeState()
    };
  }

  getSingletonNodeState() {
    return {
      hasSkybox: !!this.props.editor.scene.findNodeByType(SkyboxNode),
      hasGroundPlane: !!this.props.editor.scene.findNodeByType(GroundPlaneNode),
      hasFloorPlan: !!this.props.editor.scene.findNodeByType(FloorPlanNode)
    };
  }

  updateSingletonState = () => {
    this.setState(this.getSingletonNodeState());
  };

  render() {
    const fabClassNames = {
      [styles.fab]: true,
      [styles.fabOpen]: this.state.open,
      [styles.fabClosed]: !this.state.open
    };

    const settings = this.props.settings;
    const { open, hasSkybox, hasGroundPlane, hasFloorPlan } = this.state;

    return (
      <div className={styles.addNodeActionButtons}>
        {open && (
          <div className={styles.actionButtonContainer}>
            <AddButton
              label={ModelNode.nodeName}
              iconClassName={ModelNodeEditor.iconClassName}
              onClick={this.addModel}
            />
            <AddButton
              label={GroupNode.nodeName}
              iconClassName={GroupNodeEditor.iconClassName}
              onClick={() => this.addNode(GroupNode)}
            />
            <AddButton
              label={BoxColliderNode.nodeName}
              iconClassName={BoxColliderNodeEditor.iconClassName}
              onClick={() => this.addNode(BoxColliderNode)}
            />
            {!hasGroundPlane && (
              <AddButton
                label={GroundPlaneNode.nodeName}
                iconClassName={GroundPlaneNodeEditor.iconClassName}
                onClick={() => this.addNode(GroundPlaneNode)}
              />
            )}
            {!hasFloorPlan && (
              <AddButton
                label={FloorPlanNode.nodeName}
                iconClassName={FloorPlanNodeEditor.iconClassName}
                onClick={() => this.addNode(FloorPlanNode)}
              />
            )}
            <AddButton
              label={SpawnPointNode.nodeName}
              iconClassName={SpawnPointNodeEditor.iconClassName}
              onClick={() => this.addNode(SpawnPointNode)}
            />
            <AddButton label="Light" iconClassName={PointLightNodeEditor.iconClassName} onClick={this.addLight} />
            <AddButton label="Media" iconClassName="fa-film" onClick={this.addMedia} />
            <AddButton label="Spawner" iconClassName={SpawnerNodeEditor.iconClassName} onClick={this.addSpawner} />
            {!hasSkybox && (
              <AddButton
                label={SkyboxNode.nodeName}
                iconClassName={SkyboxNodeEditor.iconClassName}
                onClick={() => this.addNode(SkyboxNode)}
              />
            )}
            {settings.enableExperimentalFeatures && (
              <AddButton
                label={TriggerVolumeNode.nodeName}
                iconClassName={TriggerVolumeNodeEditor.iconClassName}
                onClick={() => this.addNode(TriggerVolumeNode)}
              />
            )}
          </div>
        )}
        <button onClick={this.toggle} className={classNames(fabClassNames)}>
          <i className={classNames("fas", "fa-plus")} />
        </button>
      </div>
    );
  }
}

export default withSettings(withEditor(withDialog(AddNodeActionButtons)));
