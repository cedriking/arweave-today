const getWinston = async (bytes, target) => {
    bytes = bytes || 0;
    target = target || '';

    const response = await fetch(`https://arweave.net/price/${bytes}/${target}`);

    return response.ok ? response.text() : null;
};

const createState = (state) => {
    return new Proxy(state, {
        set(obj, property, value) {
            obj[property] = value;

            const target = obj['target'].toString();
            const amount = parseInt(obj['amount']);
            const unit = parseInt(obj['unit']);
            const size = amount * unit;

            getWinston(size, target).then(data => {
                if (!data) {
                    return false;
                }

                const winston = new Big(data);
                const ar = new Big(0.000000000001);

                obj['winston'] = winston;
                obj['ar'] = (winston * ar).toFixed(12);

                render();

                return true;
            });
        }
    });
};

const state = createState({
    amount: 0,
    unit: 1,
    target: '',
    winston: 0,
    ar: 0
});

document.querySelectorAll('[data-model]').forEach(listener => {
    const name = listener.dataset.model;

    for(const e of ['keyup', 'click', 'change']) {
        listener.addEventListener(e, event => {
            state[name] = listener.value;
        });
    }
});

const render = () => {
    Array.from(document.querySelectorAll('[data-binding]'))
        .map(e => e.dataset.binding)
        .forEach(binding => {
            document.querySelector(`[data-binding='${binding}']`).innerText = state[binding];
        });
};

render();

document.getElementById('amount').click();
