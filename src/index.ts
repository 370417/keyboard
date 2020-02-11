import 'webrtc-adapter';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import { baseUrl } from './firebase-init';
import { Room } from './rtc';

const db = firebase.firestore();

let room: Room | undefined = undefined;

let mode: 'send' | 'receive' | undefined = 'send';
let send_controls: Controls = {};
let receive_controls: Controls = {};

let control_is_pressed: { [c in Control]: boolean } = {
    'up': false,
    'down': false,
    'left': false,
    'right': false,
    'jump1': false,
    'jump2': false,
    'attack': false,
    'special': false,
    'grab': false,
    'taunt': false,
    'walk': false,
    'pause': false,
    'shield1': false,
    'shield2': false,
    'c_up': false,
    'c_down': false,
    'c_left': false,
    'c_right': false,
};

const controls: Control[] = [
    'up',
    'down',
    'left',
    'right',
    'jump1',
    'jump2',
    'attack',
    'special',
    'grab',
    'taunt',
    'walk',
    'pause',
    'shield1',
    'shield2',
    'c_up',
    'c_down',
    'c_left',
    'c_right',
];

// Make sure mode updates when radio buttons are clicked
document.getElementById('send')?.addEventListener('input', function(e) {
    if ((e.target as HTMLInputElement).checked) {
        mode = 'send';
        // switch .key inputs to the send controls
        document.querySelectorAll('.key').forEach((elem) => {
            const input = elem as HTMLInputElement;
            input.value = send_controls[elem.id as Control] || '';
        });
    }
});
document.getElementById('receive')?.addEventListener('input', function(e) {
    if ((e.target as HTMLInputElement).checked) {
        mode = 'receive';
        // switch .key inputs to the receive controls
        document.querySelectorAll('.key').forEach((elem) => {
            const input = elem as HTMLInputElement;
            input.value = receive_controls[elem.id as Control] || '';
        });
    }
});

// listen for controls
window.addEventListener('keydown', function(e) {
    if (mode != 'send') {
        return;
    }
    const code = (e as KeyboardEvent).code;
    controls.forEach((control, i) => {
        if (send_controls[control] == code) {
            (document.querySelector(`[for=${control}]`) as HTMLElement).style.color = 'red';
            control_is_pressed[control] = true;
        }
    });
});
window.addEventListener('keyup', function(e) {
    if (mode != 'send') {
        return;
    }
    const code = (e as KeyboardEvent).code;
    controls.forEach((control) => {
        if (send_controls[control] == code) {
            (document.querySelector(`[for=${control}]`) as HTMLElement).style.color = '';
            control_is_pressed[control] = false;
        }
    });
});

function logControls() {
    const msg = controls.map((c) => control_is_pressed[c] ? 't' : 'f').join('');
    room?.send(msg);
    window.requestAnimationFrame(logControls);
}
logControls();

document.querySelectorAll('.key').forEach(function(elem) {
    elem.addEventListener('keydown', function(e) {
        const locked = (document.getElementById('lock') as HTMLInputElement)?.checked;
        if (locked) {
            e.preventDefault();
            return;
        }
        let code = (e as KeyboardEvent).code;
        if ((e as KeyboardEvent).shiftKey && code == 'Backspace') {
            control_is_pressed[elem.id as Control] = false;
            (document.querySelector(`[for=${elem.id}]`) as HTMLElement).style.color = '';
            code = '';
        }
        (elem as HTMLInputElement).value = code;
        if (mode == 'send') {
            send_controls[elem.id as Control] = code;
        }
        if (mode == 'receive') {
            receive_controls[elem.id as Control] = code;
        }
        e.preventDefault();
    }, true);
});

type Control =
    | 'up'
    | 'down'
    | 'left'
    | 'right'
    | 'jump1'
    | 'jump2'
    | 'attack'
    | 'special'
    | 'grab'
    | 'taunt'
    | 'walk'
    | 'pause'
    | 'shield1'
    | 'shield2'
    | 'c_up'
    | 'c_down'
    | 'c_left'
    | 'c_right';

type Controls = {
    [c in Control]?: string;
};

firebase.auth().onAuthStateChanged(function(user) {
    const encodedTargetEmail = new URLSearchParams(window.location.search).get('target');
    if (user && encodedTargetEmail) {
        const targetEmail = decodeURIComponent(encodedTargetEmail);
        // User is signed in and targetEmail is known.
        if (user.email) {
            // setupCanvas(canvas);
            // @ts-ignore (captureStream is not stable yet)
            // const stream: MediaStream = canvas.captureStream(10);
            // const track = stream.getTracks()[0];
            room = new Room(
                db,
                targetEmail,
                user,
                (msg) => console.log(msg.data),
            );
        }
    } else {
        // User is signed out and/or targetEmail is not set.
        window.location.href = `${baseUrl}/signin/`;
    }
});
