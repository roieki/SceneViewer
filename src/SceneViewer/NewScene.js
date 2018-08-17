import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as aframe from 'aframe'
import * as fff from 'aframe-text-geometry-component'
import * as kkk from 'aframe-event-set-component'
import { Entity, Scene } from 'aframe-react'
import Camera from './Camera'
import assets from '../assets/registerAssets'
import { getAssetsQuery, getSceneQuery } from '../GraphQL'
import registerClickDrag from 'aframe-click-drag-component'
import { TankerShipScene, GraphScene } from './Scenes'
import { checkpoints, makeCargoShips } from "./Prefabs"
import { Query, query } from 'react-apollo'
import {
    View,
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native-web'
import { format } from 'url';

// const props = {
//     showInfoModal,
//     containerNode: {
//         id: "", // ID of top level a-entity
//         name: "", // Use to determine container component. Needs more thoughts
//         position: { // Position of top level a-entity
//             x: 0,
//             y: 0,
//             z: 0
//         } //ContainerNode is NOT a 3d model
//     },
//     semanticLayoutNodes: [ // Use this to 3d models
//         {
//             physicalModel: {
//                 physicalAsset: { name: "AssetName" } // Used to refer to assets registered on app load
//             },
//             position: {
//                 x: 0,
//                 y: 0,
//                 z: 0
//             },
//             rotation: {
//                 x: 0,
//                 y: 0,
//                 z: 0
//             },
//             scale: {
//                 x: 0,
//                 y: 0,
//                 z: 0
//             }
//         }
//     ],
//     connectedTo: [ // Use this to make checkpoints
//         {
//             id: "",
//             position: {
//                 x: 0,
//                 y: 0,
//                 z: 0
//             }
//         }
//     ]
// }


class SceneViewer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ships: [ //REMOVE ASAP
                {
                    overlayText: [
                        "Propeller health: 75%",
                        "Fuel Levels: 95%"
                    ]
                }, {
                    overlayText: [
                        "Propeller health: 25% *",
                        "Engine health: 99%",
                        "Rudder health: 82%"
                    ]
                }
            ],
        }
        console.log("Scene state: ", this.state)
    }



    _renderContainer = () => {

    }

    _renderCheckpoints = () => {

    }

    _getQueryData = (queries) => {
        console.log("Get data queries: ", queries)
        return queries.map((query, i) => {
            return (

                <Query key={i} query={getSceneQuery(query)}>
                    {({ loading, error, data }) => {
                        if (loading) return <ActivityIndicator color={'#fff'} />
                        if (error) return <Text>{`Error: ${error}`}</Text>
                        // console.log("Query data: ", data)

                        if (data.scene.id === "cjkn3ca5kgm8a0b77fr3a28q5") { // If ship composite node
                            return (
                                <a-entity>
                                    {this._renderShipContainer(data.scene, data.scene.children)}
                                </a-entity>
                            )
                        } else {
                            console.log("Query data: ", data)
                            return (
                                <a-entity position="0 3 -4">

                                    {this._renderScene(data.scene, [...data.scene.children, data.scene.parent])}
                                </a-entity>
                            )
                        }

                    }}
                </Query>
            )
        })

    }

    _make3dEntity = (props) => {
        const { scale, rotation, name } = props
        console.log("Make 3d entity name: ", name)
        return (
            <a-entity
                scale={`${1} ${1} ${1}`}
                rotation={`${rotation.x} ${rotation.y} ${rotation.z}`}
                obj-model={`obj: #${name}-obj;`}
            >
                <a-animation attribute="rotation"
                    dur="30000"
                    fill="forwards"
                    to="0 360 0"
                    repeat="indefinite"></a-animation>
            </a-entity>
        )
    }

    _makePrimitiveEntity = (props) => {
        console.log("Make primitive entity props: ", props)
        const { scale, name = "box" } = props

        return (
            <a-entity
                geometry={`primitive: box;`}
                material="color: orangered"
            >
                <a-animation attribute="rotation"
                    dur="30000"
                    fill="forwards"
                    to="0 360 0"
                    repeat="indefinite"></a-animation>
            </a-entity>
        )
    }

    // TODO: Broken maybe?:

    _renderScene = (scene, points) => {
        const { semanticLayoutNodes, children, parent, id } = scene

        console.log("Render Scene data: ", scene)

        const nodes = semanticLayoutNodes.map((semanticLayoutNode, i) => {
            console.log("semanticLayoutNode: ", semanticLayoutNode)
            const { position } = scene.containerNode
            const { physicalModel, rotation, scale } = semanticLayoutNode
            const { physicalAsset } = physicalModel
            const { modelType } = physicalAsset

            return (
                <a-entity // CONTAINER NODE, CURRENTLY BLANK IF NOT CONTAINER SHIP
                    key={i}
                    id={id}
                    position={`${position.x} ${position.y} ${-6}`}
                >
                    {checkpoints(points)}

                    {modelType === "GEOMETRY" ? this._makePrimitiveEntity({ scale, modelType, name: physicalModel.name }) : this._make3dEntity({ scale, rotation, name: physicalAsset.name })}
                </a-entity>
            )
        })

        console.log("Nodes: ", nodes)
        return nodes
    }

    _renderShipContainer = (scene, points) => { // Need to abstract this out asap
        const { containerNode, semanticLayoutNodes, id } = scene
        const { showInfoModal } = this.props

        const formattedData = semanticLayoutNodes.map((semanticLayoutNode, i) => {
            const { physicalModel, position, rotation, scale } = semanticLayoutNode
            const { physicalAsset } = physicalModel
            const { name } = physicalAsset

            return {
                name,
                scale,
                position,
                rotation
            }
        })

        return (
            <a-entity id={id}>
                {checkpoints(points, "child")}
                {makeCargoShips({ options: this.state.ships, showInfoModal, childData: formattedData })}
            </a-entity>
        )
    }

    render() {

        // Container node references
        console.log("New Scene props: ", this.props)

        return (
            <a-entity>
                {this._getQueryData(this.props.queries)}
            </a-entity>
        )
    }
}

export default SceneViewer
