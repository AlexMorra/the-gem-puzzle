// init
let root = document.querySelector(':root');
let rootStyle = getComputedStyle(root);
let body = document.querySelector('body');
let start_button = document.querySelector('#start');
let save_button = document.querySelector('#save');
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
let width = (body.offsetWidth - 2) / 4 - 2;
root.style.setProperty('--size', width + 'px');
// console.log(rootStyle.getPropertyValue('--size'));

// LOAD STATE
if (localStorage.getItem('save_options')) {
    save_options = JSON.parse(localStorage.getItem('save_options'));
    start_game(save_options.field_size, save_options.saved_numbers);
    timer(save_options.sec, save_options.min);
    steps_count = save_options.steps_count;
    steps.textContent = steps_count;
}

// START GAME
start_button.addEventListener('click', () => {
    start_game(field_size)
});

// SAVE STATE
save_button.addEventListener('click', (e) => {
    e.target.style.color = 'green';
    setTimeout(() => e.target.removeAttribute('style'), 700);

    current_result = [...field_items].map(el => +el.textContent);
    localStorage.setItem('save_options', JSON.stringify(save_state(steps_count, min, sec, current_result, field_size)));
});

// RESIZE
window.addEventListener('resize', () => {
    let width = (body.offsetWidth - 2) / 4 - 2;
    root.style.setProperty('--size', width + 'px');
});

// [0, 2, 4, 3, 1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
// START GAME
function start_game(field_size, save_numbers=null) {
    if (field) field.remove();
    let init_field = document.createElement('div');
    init_field.classList.add('field-wrapper4x4');
    body.append(init_field);
    field = document.querySelector('.field-wrapper4x4');
    let numbers = null;
    if (save_numbers) {
        numbers = save_numbers;
    } else {
        numbers = Array.from({length: field_size * field_size}, (v,k) => k)
            .sort(() => Math.random() - 0.5);
    }
    numbers.forEach((value, i) => {
        let item = document.createElement('div');
        item.textContent = value ? value : '';
        item.classList.add('item');
        item.setAttribute('id', i + 1);
        field.append(item)
    });
    field_items = document.querySelectorAll('.item');

    field.addEventListener('click', game_watcher);
    timer()
}

function game_watcher(e) {

    let current_element = e.target;
    let current_position = current_element.getAttribute('id');
    let empty_element = [...field_items].filter(el => !el.textContent)[0];
    let empty_position = empty_element.getAttribute('id');

    if (e.target.closest('.item')) {
        // console.log(current_element);
        // console.log(current_position, '--- CURRENT POSSITION');
        if (is_allowed_move(current_position, empty_position, steps_4x4)) {
            steps_count++;
            steps.textContent = steps_count;

            console.log('MOOOOVE');

            move(current_element, empty_element);
            field_items = document.querySelectorAll('.item');
            current_result = [...field_items].map(el => +el.textContent).filter(el => el);
            check_result(current_result);
        } else console.log('NOOOOOOOO')
    }
}

function is_allowed_move(current, empty, steps) {
    return steps[current].includes(+empty)
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
    // console.log(result);
    // console.log(win);
    // console.log(result.join('') === win);
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
    console.log(steps_count, min, sec, saved_numbers, field_size);
    save_options['steps_count'] = steps_count;
    save_options['min'] = min;
    save_options['sec'] = sec;
    save_options['saved_numbers'] = saved_numbers;
    save_options['field_size'] = field_size;
    return save_options
}