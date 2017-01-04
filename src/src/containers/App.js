import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {ActionCreators as UndoActionCreators} from 'redux-undo';
import pureRender from 'pure-render-decorator';

import * as Actions from '../actions';
import Action from '../components/Action';
import DropZone from '../components/DropZone';
import FPS from '../components/FPS';
import Editor from '../components/Editor';

import '../assets/stylesheets/global.css';
import '../assets/stylesheets/font-awesome.min.css';
import '../assets/stylesheets/App.css';

@pureRender
class App extends Component {

	constructor(props) {

		super(props);

		this._nextStateAnimationFrameId = null;

		this.state = {
			windowWidth: window.innerWidth,
			windowHeight: window.innerHeight,
			dropZoneHidden: true
		};

		this.resizeHandle = this.resizeHandle.bind(this);
		this.keyDownHandle = this.keyDownHandle.bind(this);
		this.handlePaste = this.handlePaste.bind(this);
		this.showDropZone = this.showDropZone.bind(this);
		this.hideDropZone = this.hideDropZone.bind(this);

	}

	_setNextState(state) {
		if (this._nextStateAnimationFrameId) {
			cancelAnimationFrame(this._nextStateAnimationFrameId);
		}
		this._nextStateAnimationFrameId = requestAnimationFrame(()=> {
			this._nextStateAnimationFrameId = null;
			this.setState(state);
		});
	}

	keyDownHandle(e) {

		// console.log(e);

		// copy result
		if (e.ctrlKey && e.keyCode == 67) {
			this.props.copy_result();
		}

	}

	resizeHandle(e) {
		this._setNextState({
			windowWidth: e.target.innerWidth,
			windowHeight: e.target.innerHeight
		});
	}

	handlePaste(e) {
		// console.log(e.clipboardData.getData('Text'));
		const text = e.clipboardData.getData('Text');
		if (text) {
			this.props.append_source_data(text.trim());
		}
	}

	showDropZone(e) {
		// console.log(e);
		e.preventDefault();
		if (e.dataTransfer.types && e.dataTransfer.types[0] == 'Files') {
			this.setState({
				dropZoneHidden: false
			});
		}
	}

	hideDropZone(e) {
		this.setState({
			dropZoneHidden: true
		});
	}

	componentDidMount() {
		window.addEventListener('resize', this.resizeHandle);
		window.addEventListener('keydown', this.keyDownHandle);
		window.addEventListener('dragenter', this.showDropZone);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.resizeHandle);
		window.removeEventListener('keydown', this.keyDownHandle);
		window.removeEventListener('dragenter', this.showDropZone);
	}

	render() {

		const {
			app_data, append_source_data,
			modify_source, delete_source_line, delete_source_node,
			modify_result, delete_result_line, delete_result_node,
			format_data, copy_result, undo, redo, jumpToPast, clearHistory
		} = this.props;

		const {windowWidth, windowHeight, dropZoneHidden} = this.state;

		const {handlePaste, showDropZone, hideDropZone} = this;

		return (
			<div className="App">

				<Editor className="source"
				        value={app_data.present.source}
				        width={windowWidth}
				        height={windowHeight}
				        options={{
					        gutterPosition: "right"
				        }}/>

				{/*<Action app_data={app_data}*/}
				{/*format_data={format_data}*/}
				{/*copy_result={copy_result}*/}
				{/*undo={undo}*/}
				{/*redo={redo}*/}
				{/*jumpToPast={jumpToPast}*/}
				{/*clearHistory={clearHistory}/>*/}

				{/*<Editor className="result"*/}
				{/*value={app_data.present.result}*/}
				{/*width={windowWidth / 2 - 120}*/}
				{/*height={windowHeight}*/}
				{/*options={{*/}
				{/*gutterPosition: "right"*/}
				{/*}}/>*/}

				<DropZone hidden={dropZoneHidden}
				          show={showDropZone}
				          hide={hideDropZone}
				          append_source_data={append_source_data}></DropZone>

				{
					/*process.env.NODE_ENV == 'development' && <FPS/>*/
				}

			</div>
		);

	}
}

App.propTypes = {

	// redux state
	app_data: PropTypes.object,

	// redux action
	append_source_data: PropTypes.func,
	format_data: PropTypes.func,
	undo: PropTypes.func,
	redo: PropTypes.func

};

function mapStateToProps(state, ownProps) {
	return {
		app_data: state.data
	};
}

// function mapDispatchToProps(dispatch) {
// 	return bindActionCreators(Actions, dispatch);
// }

function mapDispatchToProps(dispatch) {
	let actions = bindActionCreators(Actions, dispatch);
	actions.undo = () => dispatch(UndoActionCreators.undo());
	actions.redo = () => dispatch(UndoActionCreators.redo());
	actions.jumpToPast = (index) => dispatch(UndoActionCreators.jumpToPast(index));
	actions.clearHistory = () => dispatch(UndoActionCreators.clearHistory());
	return actions;
}

export default connect(mapStateToProps, mapDispatchToProps)(App);