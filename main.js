function init(opts) {
	opts = opts || {};

	// Массив точек
	var snake = [];

	// Координаты созданной точки
	var point = [];

	// ID запущенного интервала
	var interval_id;

	// Флаг окончания игры
	var is_game_over = false;

	// Дополнительные настройки
	var options = {
		size_area: opts.size_area || 30, // Размер площадки
		speed: opts.speed || 100,        // Скорость движения
		random: opts.random || true,     // Произвольное появление змейки
		through: opts.through || false   // Сквозное движение через границы
	};

	// Текущее направление движения
	var direction;

	// Флаг изменения направления движения
	var direction_changed = false;

	// Направления движений
	var directions = {
		37: "left",  // Влево
		38: "top",   // Вверх
		39: "right", // Вправо
		40: "bottom" // Вниз
	};

	/**
	 * Отрисовка площадки
	 */
	function render_area() {
		var grid = document.getElementsByClassName("area")[0],
				table = document.createElement("table"),
				tbody = document.createElement("tbody"),
				row, cell, input;

		table.appendChild(tbody);

		for (var i = 0; i < options.size_area; i++) {
			row = document.createElement("tr");
			row.className = "row";
			for (var j = 0; j < options.size_area; j++) {
				cell = document.createElement("td");
				cell.className = "cell";
				input = document.createElement("input");
				input.setAttribute("type", "checkbox");
				cell.appendChild(input);
				row.appendChild(cell);
			}
			tbody.appendChild(row);
		}
		grid.appendChild(table);

		var inputs = grid.getElementsByTagName("input");
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].checked = false;
			inputs[i].onclick = function() {
				return false;
			}
		}
	}

	/**
	 * Отслеживание события нажатия кливиш со стрелками
	 */
	document.onkeydown = function(event) {
		if ([37, 38, 39, 40].indexOf(event.which) >= 0 && ! interval_id && ! is_game_over) {
			direction = directions[event.which];
			interval_id = setInterval(function() {
				direction_changed = false;
				build_route();
				is_snake(snake[0].x, snake[0].y) || is_border() ? game_over() : move();
			}, options.speed);
		} else if ([37, 38, 39, 40].indexOf(event.which) >= 0 && ! is_game_over) {
			change_direction(event);
		} else {
			if (is_game_over && event.which == 32) {
				init({
					size_area: parseInt(document.getElementById("size_area").value, 10),
					speed: parseInt(document.getElementById("speed").value, 10),
					random: true,
					through: document.getElementById("through").checked
				});
			}
		}
	};

	/**
	 * Смена направления движения
	 */
	function change_direction(event) {
		if (direction == "right" || direction == "left") {
			if ([38, 40].indexOf(event.which) >= 0 && ! direction_changed) {
				direction = directions[event.which];
			}
		} else if (direction == "top" || direction == "bottom") {
			if ([37, 39].indexOf(event.which) >= 0 && ! direction_changed) {
				direction = directions[event.which];
			}
		}
		direction_changed = true;
	}

	/**
	 * Инициализация приложения
	 */
	(function run() {
		clear_area();
		render_area();
		create_snake();
		create_point();
	})();

	/**
	 * Очищение площадки
	 */
	function clear_area() {
		document.getElementsByClassName("area")[0].innerHTML = "";
		document.getElementsByClassName("area")[0].className = "area";
		document.getElementsByClassName("score")[0].innerHTML = snake.length * 10;

		// Установка дефолтных значений
		document.getElementById("size_area").value = options.size_area;
		document.getElementById("speed").value = options.speed;
		document.getElementById("through").checked = options.through;
	}

	/**
	 * Создание змейки
	 */
	function create_snake() {
		var start_point = options.random ? random_point() : [1, 1];
		increase_snake(start_point[0], start_point[1]);
	}

	/**
	 * Создание точки
	 */
	function create_point() {
		point = random_point();
		if (is_snake(point[0], point[1])) {
			create_point();
		} else {
			var area_cell = get_table_cell(point[0], point[1]);
			area_cell.innerHTML = "<input type='radio' checked='checked' />";
		}
	}

	/**
	 * Формирование произвольной точки на площадке
	 */
	function random_point() {
		var x = Math.floor(Math.random() * (options.size_area - 1 + 1)) + 1,
				y = Math.floor(Math.random() * (options.size_area - 1 + 1)) + 1;
		return [x, y];
	}

	/**
	 * Удаление точки
	 */
	function remove_point() {
		var area_cell = get_table_cell(point[0], point[1]);
		area_cell.innerHTML = "<input type='checkbox' checked='checked' />";
		point = [];
	}

	/**
	 * Проверка замыкания змейки
	 */
	function is_snake(x, y) {
		var is_snake = false;
		for (var i = 1; i < snake.length; i++) {
			if (x == snake[i].x && y == snake[i].y) {
				is_snake = true;
				break;
			}
		}
		return is_snake;
	}

	/**
	 * Проверка окончания площадки
	 */
	function is_border() {
		if ((direction == "right" && snake[0].y > options.size_area) ||
				(direction == "left" && snake[0].y < 1) ||
				(direction == "bottom" && snake[0].x > options.size_area) ||
				(direction == "top" && snake[0].x < 1)
		) {
			return ! options.through;
		}
		return false;
	}

	/**
	 * Построение маршрута
	 */
	function build_route() {
		for (var i = 0; i < snake.length; i++) {
			snake[i]._x = snake[i].x;
			snake[i]._y = snake[i].y;
		}

		if (options.through) {
			if (direction == "right") snake[0].y >= options.size_area ? snake[0].y = 1 : snake[0].y += 1;
			else if (direction == "left") snake[0].y <= 1 ? snake[0].y = options.size_area : snake[0].y -= 1;
			else if (direction == "bottom") snake[0].x >= options.size_area ? snake[0].x = 1 : snake[0].x += 1;
			else if (direction == "top") snake[0].x <= 1 ? snake[0].x = options.size_area : snake[0].x -= 1;
		} else {
			if (direction == "right") snake[0].y += 1;
			else if (direction == "left") snake[0].y -= 1;
			else if (direction == "bottom") snake[0].x += 1;
			else if (direction == "top") snake[0].x -= 1;
		}
	}

	/**
	 * Движение всех точек по позициям
	 */
	function move_snake_tail(i) {
		i = (i || 0);
		if (snake[i + 1]) {
			snake[i + 1].x = snake[i]._x;
			snake[i + 1].y = snake[i]._y;
			move_snake_tail(i + 1);
		} else {
			get_area_point(snake[i]._x, snake[i]._y).checked = false;
		}
	}

	/**
	 * Увеличение змейки
	 */
	function increase_snake(x, y) {
		snake.push({x: x, y: y});
		get_area_point(x, y).checked = true;
	}

	/**
	 * Движение точек
	 */
	function move() {
		move_snake_tail();
		get_area_point(snake[0].x, snake[0].y).checked = true;

		if (snake[0].x == point[0] && snake[0].y == point[1]) {
			remove_point();
			create_point();
			increase_snake(snake[snake.length - 1]._x, snake[snake.length - 1]._y);
			document.getElementsByClassName("score")[0].innerHTML = snake.length * 10;
		}
	}

	/**
	 * Выбор ячейки таблицы
	 */
	function get_table_cell(row, cell) {
		return document.getElementsByTagName("table")[0].
				getElementsByTagName("tbody")[0].
				getElementsByTagName("tr")[row - 1].
				getElementsByTagName("td")[cell - 1];
	}

	/**
	 * Выбор чекбокса ячейки таблицы
	 */
	function get_area_point(row, cell) {
		return document.getElementsByTagName("table")[0].
				getElementsByTagName("tbody")[0].
				getElementsByTagName("tr")[row - 1].
				getElementsByTagName("td")[cell - 1].
				getElementsByTagName("input")[0];
	}

	/**
	 * Завершение игры
	 */
	function game_over() {
		clearInterval(interval_id);
		document.getElementsByClassName("area")[0].className = "area game_over";
		is_game_over = true;
	}

	document.getElementsByClassName("settings")[0].getElementsByTagName("a")[0].onclick = function() {
		var a = document.getElementsByClassName("settings-wrapper")[0],
				a_class = a.className;

		if (a_class == "settings-wrapper hidden") {
			a.className = "settings-wrapper";
		} else {
			a.className = "settings-wrapper hidden";
		}
		return false;
	};

	document.getElementsByClassName("actions-panel")[0].getElementsByClassName("reset")[0].onclick = function() {
		document.getElementById("size_area").value = 30;
		document.getElementById("speed").value = 100;
		document.getElementById("through").checked = false;
	};

	document.getElementsByClassName("actions-panel")[0].getElementsByClassName("save")[0].onclick = function() {
		document.getElementsByClassName("settings-wrapper")[0].className = "settings-wrapper hidden";
		clearInterval(interval_id);
		init({
			size_area: parseInt(document.getElementById("size_area").value, 10),
			speed: parseInt(document.getElementById("speed").value, 10),
			random: true,
			through: document.getElementById("through").checked
		});
	};

	document.getElementsByClassName("actions-panel")[0].getElementsByClassName("close")[0].onclick = function() {
		document.getElementsByClassName("settings-wrapper")[0].className = "settings-wrapper hidden";
		return false;
	};
}