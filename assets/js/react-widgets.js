(function () {
    if (!window.React || !window.ReactDOM) {
        return;
    }

    var useEffect = React.useEffect;
    var useState = React.useState;

    function Badge(props) {
        return React.createElement(
            'div',
            {
                style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 12px',
                    borderRadius: '999px',
                    border: '1px solid rgba(104, 171, 255, 0.35)',
                    background: 'rgba(8, 28, 58, 0.55)',
                    color: '#d8ecff',
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                }
            },
            React.createElement('span', {
                style: {
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#50b3ff',
                    boxShadow: '0 0 10px #50b3ff'
                }
            }),
            props.text
        );
    }

    function StatsBoard() {
        var stats = [
            { label: 'Design System', value: '18 Modules' },
            { label: 'Visual Theme', value: 'Darkblue / Black' },
            { label: 'UI Stack', value: 'HTML CSS JS React' },
            { label: 'Ready For', value: 'Catalog + Checkout' }
        ];

        return React.createElement(
            'div',
            {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '9px'
                }
            },
            stats.map(function (item) {
                return React.createElement(
                    'div',
                    {
                        key: item.label,
                        style: {
                            borderRadius: '12px',
                            border: '1px solid rgba(127, 184, 255, 0.24)',
                            background: 'rgba(7, 25, 52, 0.65)',
                            padding: '10px'
                        }
                    },
                    React.createElement(
                        'div',
                        {
                            style: {
                                color: '#99bfe8',
                                fontSize: '11px',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                marginBottom: '5px'
                            }
                        },
                        item.label
                    ),
                    React.createElement(
                        'div',
                        {
                            style: {
                                color: '#e8f4ff',
                                fontWeight: 700,
                                fontSize: '14px'
                            }
                        },
                        item.value
                    )
                );
            })
        );
    }

    function QuoteTicker() {
        var quotes = [
            'Built for brands that want more than a basic template.',
            'A creative front page with backend structure you can scale.',
            'Balanced for style, speed, and conversion-oriented flow.'
        ];
        var quoteState = useState(0);
        var idx = quoteState[0];
        var setIdx = quoteState[1];

        useEffect(function () {
            var timer = setInterval(function () {
                setIdx(function (prev) {
                    return (prev + 1) % quotes.length;
                });
            }, 3200);
            return function () {
                clearInterval(timer);
            };
        }, []);

        return React.createElement(
            'p',
            {
                style: {
                    margin: 0,
                    color: '#b6d0ef',
                    fontSize: '13px',
                    lineHeight: 1.5
                }
            },
            quotes[idx]
        );
    }

    var mounts = document.querySelectorAll('[data-react-badge]');
    mounts.forEach(function (mount) {
        var text = mount.getAttribute('data-react-badge') || 'React UI Active';
        var root = ReactDOM.createRoot(mount);
        root.render(React.createElement(Badge, { text: text }));
    });

    var statsMounts = document.querySelectorAll('[data-react-stats]');
    statsMounts.forEach(function (mount) {
        var statsRoot = ReactDOM.createRoot(mount);
        statsRoot.render(React.createElement(StatsBoard));
    });

    var quoteMounts = document.querySelectorAll('[data-react-quotes]');
    quoteMounts.forEach(function (mount) {
        var quoteRoot = ReactDOM.createRoot(mount);
        quoteRoot.render(React.createElement(QuoteTicker));
    });
})();
