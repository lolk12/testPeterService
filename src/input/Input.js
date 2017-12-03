import React, { Component } from 'react';
import './Input.css';
import logo from './logo.svg';


class Input extends Component {

	constructor (){
		super();
		this.handleChange = this.handleChange.bind( this );
		this.handleDrop = this.handleDrop.bind(this);
		this.supportFileApi = false;
		this.count = 0;
		this.state = {
			count: 0,
			valueInputFile: '',
			error: ''
		};
		if ( window.File && window.FileReader && window.FileList && window.Blob ) this.supportFileApi = true;
	}

	readFile (file){
		return new Promise((resolve,reject) => {
			let reader = new FileReader();

			reader.onload = () => resolve(reader.result); // полученный результат отправляем на подсчет объектов
			reader.onerror = () => reject('Ошибка загрузки файла');

			if ( !file ){ // Проверяем есть ли File
				reject( 'Файл отсутствует' );
			}else if ( file.type !== 'application/json' ){ // Проверяем тип файла
				reject( file.type? "Это не JSON type: " + file.type: "Тип файла неизвестен или отсутствует" );
			}else if ( !file.size ){ // Проверяем пустой ли файл
				reject( 'Файл пустой ' );
			}else {
				reader.readAsText( file ); // Если все в порядке читаем
			}
		})
	}

	_amountObject (obj ){
		for ( let i in obj ){
			if ( typeof obj[i] === 'object' ){
				this.count++;
				if ( (this.count % 300) !== 1 ){  // Очищаем call stack каждые 300 вызовов функции
					this._amountObject( obj[i] );
				}else {
					setTimeout ( () => this._amountObject( obj[i] ), 0);
				}
			}
		}
	}

	_setStateError(err){
		this.setState({
			error: err
		})
	}

	handleChange ( e ){ // Ловим событие Change
		this.count = 0;  // Счетчик колличества объектов в JSON file
		this._setStateError(''); // Обнуляем ошибку
		this.setState({
			valueInputFile: ''
		});
		let file; // обьект File

		if ( e.dataTransfer ){ // Проверяем каким способом получен file
			file = e.dataTransfer.files[0]; // (Получени через Drag'n drop )
		}else {
			file = e.target.files[0];   // (Получени через input )

			this.setState({
				valueInputFile: e.target.value  // Устанавливаем состояние file в input
			})
		}

		if ( this.supportFileApi ){ // ПРоверка на поддержку браузера
			this.readFile( file )
				.then( text =>{
					let json = JSON.parse( text ); // Парсим полученный file JSON
					this._amountObject(json); // Считаем колличество Object в File JSON

					this.setState({
						count: this.count, // Выставляем полученное количество в состояние
					});

				})
				.catch( err =>{
					this.setState({
						valueInputFile: '', // Если ошибка убираем таргет с File
					});

					if (typeof err === 'string'){ // Проверяем какую ошибку отловили, из Catch или Promise reject
						console.error(err);
						this._setStateError(err);
					}else {
						console.error('JSON invalid : ', err);
						this._setStateError('Не валидный JSON');
					}
				})
		}else {
			console.log('File API not supported');
			this._setStateError('Ваш браузер не поддерживает File API');
		}
	}

	handleDrop ( e ){
		e.target.style.backgroundColor = '#eee';
		this.handleChange( e );
		e.preventDefault(); // отменяем действие по умолчанию
	}

	hangleDragOver ( e ){
		e.target.style.backgroundColor = '#ccc';
		e.preventDefault();  // отменяем действие по умолчанию
	}

	handleDragLeave ( e ){
		e.target.style.backgroundColor = '#eee';
		e.preventDefault();  // отменяем действие по умолчанию
	}


	render(){
		let name = 'Alexey';
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h1 className="App-title">Welcome to React, { name }</h1>
					<h1 className="App-title">Number of objects, { this.state.count }</h1>
				</header>
				<div
					className="drop"
					onDrop={ this.handleDrop }
					onDragOver={ this.hangleDragOver }
					onDragLeave={ this.handleDragLeave }
				>
					<input
						id="control"
						type="file"
						accept="application/json"
						value={ this.state.valueInputFile }
						onChange={ this.handleChange }
					/>
					<p>{ this.state.error ? this.state.error: '' }</p>
				</div>
			</div>
		);
	}
}
export default Input;