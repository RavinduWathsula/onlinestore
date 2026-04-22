(function () {
    // Compatibility shim for scripts that expect mgt.clearMarks().
    if (typeof window.mgt !== 'object' || window.mgt === null) {
        window.mgt = {};
    }

    if (typeof window.mgt.clearMarks !== 'function') {
        window.mgt.clearMarks = function () {
            return null;
        };
    }

    function initTypeCycle() {
        var target = document.querySelector('[data-type-cycle]');
        if (!target) {
            return;
        }

        var phrases = [
            'Precision Shopping',
            'Next-Gen Commerce',
            'Midnight Blue Experience'
        ];

        var idx = 0;
        setInterval(function () {
            idx = (idx + 1) % phrases.length;
            target.style.opacity = '0';
            setTimeout(function () {
                target.textContent = phrases[idx];
                target.style.opacity = '1';
            }, 180);
        }, 2800);
    }

    function init3DBackground() {
        var canvas = document.getElementById('bg-canvas');
        if (!canvas) {
            return;
        }

        if (!window.THREE) {
            document.body.classList.add('no-three');
            return;
        }

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 8;

        var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        var ambient = new THREE.AmbientLight(0x4b80ff, 0.7);
        scene.add(ambient);

        var point = new THREE.PointLight(0x5ec1ff, 1.2, 100);
        point.position.set(4, 6, 8);
        scene.add(point);

        var ringGeometry = new THREE.TorusKnotGeometry(2.1, 0.44, 120, 12);
        var ringMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1c79ff,
            metalness: 0.65,
            roughness: 0.25,
            transparent: true,
            opacity: 0.44,
            clearcoat: 1,
            clearcoatRoughness: 0.25
        });

        var ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(2.5, 1.1, -4);
        scene.add(ring);

        var particlesGeo = new THREE.BufferGeometry();
        var count = 900;
        var positions = new Float32Array(count * 3);

        for (var i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 24;
            positions[i + 1] = (Math.random() - 0.5) * 14;
            positions[i + 2] = (Math.random() - 0.5) * 22;
        }

        particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        var particlesMat = new THREE.PointsMaterial({
            color: 0x7dc2ff,
            size: 0.045,
            transparent: true,
            opacity: 0.8
        });

        var stars = new THREE.Points(particlesGeo, particlesMat);
        scene.add(stars);

        window.addEventListener('resize', function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });

        var mouseX = 0;
        var mouseY = 0;

        window.addEventListener('mousemove', function (event) {
            mouseX = (event.clientX / window.innerWidth - 0.5) * 0.7;
            mouseY = (event.clientY / window.innerHeight - 0.5) * 0.4;
        });

        function animate() {
            stars.rotation.y += 0.0007;
            stars.rotation.x += 0.0002;

            ring.rotation.x += 0.004;
            ring.rotation.y += 0.003;
            ring.position.y += Math.sin(Date.now() * 0.0012) * 0.0008;
            ring.position.x += (2.5 + mouseX) * 0.02 - ring.position.x * 0.02;
            ring.position.y += (1.1 - mouseY) * 0.02 - ring.position.y * 0.02;

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }

        animate();
    }

    function addCardTilt() {
        var cards = document.querySelectorAll('[data-tilt]');
        cards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var cx = e.clientX - rect.left;
                var cy = e.clientY - rect.top;
                var rx = (cy / rect.height - 0.5) * -8;
                var ry = (cx / rect.width - 0.5) * 10;
                card.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-3px)';
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initTypeCycle();
        init3DBackground();
        addCardTilt();
    });
})();
