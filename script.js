// init
let root = document.querySelector(':root');
let rootStyle = getComputedStyle(root);
let body = document.querySelector('body');
let start_button = document.querySelector('#start');
let save_button = document.querySelector('#save');
let results_button = document.querySelector('#results');
body.append(init_filed_size_options());
let menu_options = document.querySelector('.menu-options');
let steps = document.getElementById('steps');
let steps_count = 0;
let min_el = document.getElementById('m');
let sec_el = document.getElementById('s');
let field_items = null;
let min = null;
let sec = null;
let current_result = null;
let field = null;
let field_size = 4;
let empty = null;
let save_options = {};

// RESPONSIVE
let width = (body.offsetWidth - 2) / field_size - 2;
root.style.setProperty('--size', width + 'px');
// console.log(rootStyle.getPropertyValue('--size'));

window.addEventListener('resize', () => {
    let width = (body.offsetWidth - 2) / field_size - 2;
    root.style.setProperty('--size', width + 'px');
});

// LOAD STATE
if (localStorage.getItem('save_options')) {
    save_options = JSON.parse(localStorage.getItem('save_options'));
    start_game(save_options.field_size, save_options.saved_numbers);
    field_size = save_options.field_size
    steps_count = save_options.steps_count;
    steps.textContent = steps_count;
} else init_start()

if (localStorage.getItem('results_stats')) {
    results_stats = JSON.parse(localStorage.getItem('results_stats'));
}

// SAVE STATE
save_button.addEventListener('click', (e) => {
    e.target.style.color = 'green';
    setTimeout(() => e.target.removeAttribute('style'), 700);

    current_result = [...field_items].map(el => +el.textContent);
    localStorage.setItem('save_options', JSON.stringify(save_state(steps_count, min, sec, current_result, field_size)));
});

// START GAME
start_button.addEventListener('click', init_start);

function init_start() {
    steps_count = 0;
    steps.textContent = 0;
    start_game(field_size)
}

function start_game(field_size, save_numbers=null) {

    let width = (body.offsetWidth - 2) / field_size - 2;
    root.style.setProperty('--size', width + 'px');

    if (field) field.remove();
    let init_field = document.createElement('div');
    init_field.classList.add('field-wrapper');
    body.append(init_field);
    field = document.querySelector('.field-wrapper');
    let numbers = null;
    if (save_numbers) {
        numbers = save_numbers;
        timer(save_options.sec, save_options.min);
    } else {
        numbers = Array.from({length: field_size * field_size}, (v,k) => k)
            .sort(() => Math.random() - 0.5);
        timer();
    }
    numbers.forEach((value, i) => {
        let item = document.createElement('div');
        if (!value) {
            item.classList.add('empty');
            item.textContent = value;
        } else {
            item.textContent = value;
        }
        item.classList.add('item');
        item.setAttribute('id', i + 1);
        field.append(item)
    });
    field_items = document.querySelectorAll('.item');

    field.addEventListener('click', game_watcher);
}

function game_watcher(e) {

    let current_element = e.target;
    let current_position = current_element.getAttribute('id');
    let empty_element = [...field_items].filter(el => !+el.textContent)[0];
    let empty_position = empty_element.getAttribute('id');

    if (e.target.closest('.item')) {
        if (is_allowed_move(current_position, empty_position, step_option[field_size])) {
            steps_count++;
            steps.textContent = steps_count;

            let current_position = current_element.getBoundingClientRect();
            let empty_position = empty_element.getBoundingClientRect();

            current_element.style.left = 0;
            current_element.style.top = 0;
            empty_element.style.left = 0;
            empty_element.style.top = 0;

            setTimeout(() => {
                current_element.style.zIndex = 1;
                current_element.style.transition = 'all 0.3s ease';
                empty_element.style.transition = 'all 0.3s ease';
                current_element.style.left = empty_position.x - current_position.x + 'px';
                current_element.style.top = empty_position.y - current_position.y + 'px';
                empty_element.style.left = current_position.x - empty_position.x+ 'px';
                empty_element.style.top = current_position.y - empty_position.y+ 'px';
            },);

            setTimeout(() => {
                current_element.removeAttribute('style')
                empty_element.removeAttribute('style')
                move(current_element, empty_element);
                field_items = document.querySelectorAll('.item');
                current_result = [...field_items].map(el => +el.textContent).filter(el => el);

                if (check_result(current_result)) {
                    alert(`«Ура! Вы решили головоломку за ${min}:${sec} и ${steps_count} ходов»`);
                    field.remove();
                    if (localStorage.getItem('save_options')) {
                        localStorage.removeItem('save_options')
                    }
                    save_result_to_table(min, sec, steps_count, field_size)
                }
            },300);
            // ?????
            empty_element.classList.remove('shake');
        } else {
            e.target.classList.add('shake');
            setTimeout(() => e.target.classList.remove('shake'), 1000);
        }
    }
}

function is_allowed_move(current, empty, steps) {
    return steps[current].includes(empty)
}

function move(current, empty) {
    let current_id = current.getAttribute('id');
    let empty_id = empty.getAttribute('id');
    let clone_current = current.cloneNode(true);
    clone_current.setAttribute('id', empty_id);
    let clone_empty = empty.cloneNode(true);
    clone_empty.setAttribute('id', current_id);
    current.replaceWith(clone_empty);
    empty.replaceWith(clone_current);
}

function check_result(result) {
    let win = result.slice().sort((a, b) => a - b).join('');
    return result.join('') === win
}

function timer(seconds=1,minutes=0) {
    sec = seconds;
    min = minutes;
    setInterval(() => {
        if (sec > 60) {
            sec %= 60;
            min++
        }
        if (sec < 10) sec = '0' + sec;
        min_el.textContent = min < 10 ? '0' + min : min;
        sec_el.textContent = sec;
        sec++
    }, 1000)
}

function save_state(steps_count, min, sec, saved_numbers, field_size) {
    save_options['steps_count'] = steps_count;
    save_options['min'] = min;
    save_options['sec'] = sec;
    save_options['saved_numbers'] = saved_numbers;
    save_options['field_size'] = field_size;
    return save_options
}

function save_result_to_table(min, sec, steps, field_size) {
    let save_result = {
        'time': `${min}:${sec}`,
        'steps': steps
    };
    results_stats[field_size].push(save_result);
    results_stats[field_size].sort((prev, next) => prev['steps'] - next['steps']);
    if (results_stats[field_size].length > 10) results_stats[field_size].splice(9, 1);

    localStorage.setItem('results_stats', JSON.stringify(results_stats));
}

// FIELD SELECTION

menu_options.addEventListener('click', select_size);

function select_size(e) {
    if (e.target.tagName === 'LI') {
        let size = +e.target.dataset['size'];
        field_size = size;
        start_game(size);
        steps_count = 0;
    }
}

function init_filed_size_options() {
    field_size_options = [3, 4, 5, 6, 7, 8];
    let ul = document.createElement('ul');
    ul.classList.add('menu-options');
    field_size_options.forEach(el => {
        let li = document.createElement('li');
        li.classList.add('menu-option');
        li.textContent = `${el} x ${el}`;
        li.setAttribute('data-size', el);
        ul.append(li)
    });
    return ul
}


// RESULTS
let result_wrapper = document.querySelector('.results_wrapper');
let table = 0;
let active_results = false

results_button.addEventListener('click', (e) => {
    let init_active_li = document.querySelectorAll('.result_select_li');
    init_active_li.forEach(el => {
        if (parseInt(el.textContent) === field_size) {
            el.classList.add('active-results')
        } else el.classList.remove('active-results');
    });

    active_results = active_results ? false : true;
    if (active_results) {
        start_button.removeEventListener('click', init_start);
        result_wrapper.style.opacity = '0';
        setTimeout(() => {
            result_wrapper.style.opacity = '1';
        }, 100);
    } else {
        start_button.addEventListener('click', init_start);
        result_wrapper.removeAttribute('style');
    }

    let field_wrapper = document.querySelector('.field-wrapper');
    field_wrapper.classList.toggle('hide');
    // result_wrapper.classList.toggle('show');
    menu_options.classList.toggle('hide');
    result_wrapper.classList.toggle('hide');
    show_results_table(field_size);

});

let select_results_table = document.querySelector('.results_select_ul');
select_results_table.addEventListener('click', (e) => {
    let li = select_results_table.querySelectorAll('.result_select_li');
    li.forEach(el => el.classList.remove('active-results'));
    e.target.classList.add('active-results');

    let size = parseInt(e.target.textContent);
    show_results_table(size);
});



function show_results_table(size_table=3) {
    if (table) table.remove();

    table = document.createElement('table');
    table.classList.add('results_table');
    let table_tr_header = document.createElement('tr');
    table_tr_header.classList.add('results_table_tr');
    let table_header = ['№', 'Время', 'Ходов'];
    table_header.forEach(el => {
        let table_td_header = document.createElement('td');
        table_td_header.classList.add('results_table_td');
        table_td_header.textContent = el;
        table_tr_header.append(table_td_header);
        table.append(table_tr_header)
    });

    result_wrapper.append(table);



    let result_table = document.querySelector('.results_table');
    results_stats[size_table].forEach((el, i) => {
        let tr = document.createElement('tr');
        tr.classList.add('results_table_tr');
        let td = document.createElement('td');
        td.classList.add('results_table_td');
        td.textContent = i + 1;
        tr.append(td);
        for (let key in el) {
            td = document.createElement('td');
            td.classList.add('results_table_td');
            td.textContent = el[key];
            tr.append(td);
        }
        result_table.append(tr);
    });
}
