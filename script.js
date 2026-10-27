// =========================================================================
// 0. ESTILOS CSS DINÁMICOS & ANIMACIONES PARA JUEGOS DIVERSIFICADOS
// =========================================================================
const dynamicStyles = document.createElement('style');
dynamicStyles.innerHTML = `
    .fill-blocks-container {
        display: flex;
        flex-direction: column;
        gap: 15px;
        align-items: center;
        margin-top: 10px;
    }
    .phrase-target-box {
        font-size: 1.15rem;
        background: #f8f9fa;
        padding: 15px 20px;
        border-radius: 12px;
        border: 2px dashed #cbd5e1;
        text-align: center;
        width: 100%;
        color: #1e293b;
        transition: all 0.3s ease;
    }
    .blank-drop-zone {
        display: inline-block;
        padding: 4px 14px;
        background: #e2e8f0;
        border-radius: 6px;
        color: #64748b;
        font-weight: bold;
    }
    .word-blocks-pool {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
        margin-top: 10px;
    }
    .word-block {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        border: none;
        padding: 10px 18px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        font-size: 0.95rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .word-block:hover {
        transform: translateY(-3px) scale(1.03);
        box-shadow: 0 8px 12px -1px rgba(59, 130, 246, 0.3);
        background: linear-gradient(135deg, #2563eb, #1e40af);
    }
    .filled-block {
        display: inline-block;
        padding: 4px 12px;
        background: #10b981;
        color: white;
        border-radius: 6px;
        font-weight: bold;
        animation: popIn 0.3s ease;
    }

    /* Indicador de Racha (Streak) */
    .streak-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 0.95rem;
        font-weight: bold;
        color: #f59e0b;
        margin-bottom: 8px;
        animation: pulse 1.5s infinite;
    }

    /* Animaciones dinámicas */
    @keyframes popIn {
        0% { transform: scale(0.7); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-8px); }
        40%, 80% { transform: translateX(8px); }
    }
    @keyframes glowSuccess {
        0% { box-shadow: 0 0 0px #10b981; }
        50% { box-shadow: 0 0 15px #10b981; }
        100% { box-shadow: 0 0 0px #10b981; }
    }

    .shake-card { animation: shake 0.4s ease-in-out; }
    .glow-card { animation: glowSuccess 0.6s ease-in-out; }

    /* Canvas para confeti */
    #confetti-canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
    }
`;
document.head.appendChild(dynamicStyles);

// Canvas de Confeti
const confettiCanvas = document.createElement('canvas');
confettiCanvas.id = 'confetti-canvas';
document.body.appendChild(confettiCanvas);

// =========================================================================
// SINTETIZADOR DE AUDIO (EFECTOS DE SONIDO SIN ARCHIVOS EXTERNOS)
// =========================================================================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playSound(type) {
    try {
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'correct') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now); // A3
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.2); // A2
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'win') {
            // Arpegio de victoria
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, i) => {
                const subOsc = audioCtx.createOscillator();
                const subGain = audioCtx.createGain();
                subOsc.type = 'sine';
                subOsc.frequency.setValueAtTime(freq, now + i * 0.1);
                subGain.gain.setValueAtTime(0.15, now + i * 0.1);
                subGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.25);
                subOsc.connect(subGain);
                subGain.connect(audioCtx.destination);
                subOsc.start(now + i * 0.1);
                subOsc.stop(now + i * 0.1 + 0.25);
            });
        }
    } catch (e) {
        console.log("Audio not supported/blocked", e);
    }
}

// =========================================================================
// EFECTO VISUAL DE CONFETI DINÁMICO
// =========================================================================
function triggerConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    for (let i = 0; i < 70; i++) {
        particles.push({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 0.7) * 14,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            life: 1
        });
    }

    function render() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        let active = false;

        particles.forEach(p => {
            if (p.life > 0) {
                active = true;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3; // Gravedad
                p.life -= 0.02;

                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        if (active) requestAnimationFrame(render);
        else ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
    render();
}

// =========================================================================
// 1. BANCO DE DATOS UNIFICADO DE PREGUNTAS (HISTOGAME)
// =========================================================================
const RUTA_IMAGEN_PERSONAJE = "soldados.png"; 

const gameData = [
    {
        id: 1,
        title: "Tema 1: El mundo en el que caminó Jesús",
        riddles: [
            { q: "Grupo judío rebelde y radical que luchaba con violencia contra el Imperio romano.", a: "ZELOTES", ex: "Los zelotes eran una facción extremista nacionalista judía del siglo I que abogaba por la lucha armada y armada contra la opresión romana para defender la teocracia hebrea. Su nombre deriva del celo religioso por la pureza de la Ley mosaica, y su oposición radical al pago de tributos a Roma fue uno de los detonantes de la Gran Revuelta Judía del año 66 d.C. Esta revuelta terminaría con la destrucción del Segundo Templo de Jerusalén en el año 70 d.C. a manos de las legiones romanas." },
            { q: "Tribunal o consejo de líderes judíos que acusó a Jesús del delito de blasfemia.", a: "SANEDRÍN", ex: "El Sanedrín era la asamblea o consejo supremo de sabios y sacerdotes judíos con atribuciones religiosas y judiciales especiales en la Judea bajo control romano. Estaba compuesto por setenta y un miembros, entre saduceos y fariseos, presididos por el sumo sacerdote, y aunque podía dictar sentencias religiosas, dependía de la autoridad romana para ejecutar la pena capital. Esta limitación jurídica explica por qué las autoridades judías debieron remitir el caso de Jesús ante Poncio Pilato para solicitar formalmente su condena." },
            { q: "Gobernador romano de Judea que condenó a Jesús a morir en la crucifixión.", a: "PONCIO PILATO", ex: "Poncio Pilato se desempeñó como prefecto de la provincia romana de Judea entre los años 26 y 36 d.C., siendo el responsable legal de autorizar la ejecución de Jesús. Su gestión estuvo marcada por frecuentes tensiones con la población judía debido a su falta de sensibilidad religiosa, y la tradición cristiana lo recuerda por lavarse las manos simbólicamente ante la multitud antes de entregar a Jesús a la crucifixión. Fuera de los relatos evangélicos, su existencia histórica fue confirmada arqueológicamente en 1961 con el hallazgo de la llamada 'Piedra de Pilato' en Cesarea Marítima." },
            { q: "Túneles subterráneos donde se escondían los primeros cristianos perseguidos para rezar.", a: "CATACUMBAS", ex: "Las catacumbas eran galerías y pasajes subterráneos usados como cementerios colectivos donde los primeros cristianos se reunían clandestinamente durante las persecuciones imperiales. Además de servir como refugio de oración, sus paredes conservan algunas de las primeras representaciones artísticas cristianas, como el símbolo del pez (Ichthys) y el Buen Pastor, valiosas fuentes para conocer la fe de la comunidad primitiva. Actualmente, las catacumbas romanas de San Calixto y San Sebastián pueden visitarse y constituyen un testimonio arqueológico único de la vida cristiana en sus primeros siglos." },
            { q: "Apóstol mártir considerado la 'piedra' sobre la cual se fundó la Iglesia cristiana.", a: "PEDRO", ex: "San Pedro, pescador de Galilea, es considerado por la tradición cristiana como el líder de los doce apóstoles y el primer obispo y papa de la comunidad de Roma. Según los Evangelios, Jesús le cambió el nombre de Simón a Pedro (que significa 'piedra') como símbolo de la firmeza sobre la cual se edificaría la futura Iglesia cristiana. La tradición sostiene que murió martirizado en Roma bajo el emperador Nerón, crucificado boca abajo por considerarse indigno de morir de la misma forma que Jesús." }
        ],
        fillBlanks: [
            { text: "Jesús nació en la región de [Judea], un territory que estaba bajo el dominio del Imperio romano.", ans: "Judea", ex: "Judea era una región montañosa del sur de Palestina que en el siglo I d.C. operaba como una provincia romana de gran inestabilidad política y religiosa. Formaba parte de una división administrativa mayor junto con Galilea y Samaria, y su capital religiosa, Jerusalén, albergaba el Templo, centro espiritual del judaísmo. Su relief montañoso y árido dificultaba las comunicaciones internas, lo que favoreció el surgimiento de distintos grupos religiosos y políticos con posturas encontradas frente a Roma." },
            { text: "El mensaje moral de Jesús se centraba en las [Bienaventuranzas], condiciones para alcanzar la felicidad eterna.", ans: "Bienaventuranzas", ex: "Pronunciadas en el Sermón de la Montaña, las Bienaventuranzas redefinieron los valores espirituales, bendiciendo a los pobres, los pacíficos y los perseguidos. Este discurso, recogido principalmente en el Evangelio de Mateo, se considera la síntesis más importante de la ética cristiana y un modelo de vida contrapuesto a los valores de poder y riqueza de la época. Cada bienaventuranza invierte los valores tradicionales del mundo antiguo, proponiendo que la mansedumbre y la humildad, y no la fuerza, son las verdaderas fuentes de dignidad." },
            { text: "En el año 313 d.C., el emperador Constantino permitió el cristianismo mediante el Edicto de [Milán].", ans: "Milán", ex: "El Edicto de Milán proclamó la libertad religiosa en todo el Imperio romano, acabando oficialmente con las persecuciones sistemáticas a la Iglesia cristiana. Antes de este edicto, los cristianos podían ser perseguidos, encarcelados o ejecutados simplemente por practicar su fe, por lo que este documento representó un cambio radical en la política religiosa del Imperio. El edicto fue acordado conjuntamente por los emperadores Constantino y Licinio, y además de tolerar el cristianismo, ordenó la devolución de los bienes confiscados durante las persecuciones previas." },
            { text: "El emperador [Teodosio] convirtió al cristianismo en la religión oficial de todo el Imperio romano.", ans: "Teodosio", ex: "Mediante el Edicto de Tesalónica en el 380 d.C., Teodosio I prohibió el paganismo clásico y consolidó al cristianismo niceno como fe estatal exclusiva. A partir de entonces, quienes no profesaran la doctrina nicena eran considerados herejes, lo que marcó el inicio de una etapa de intolerancia religiosa oficial dentro del propio cristianismo. Con este edicto, el cristianismo dejó de ser solo una religión tolerada para convertirse en la única fe oficial y obligatoria de todo el Imperio romano." },
            { text: "San Agustín, gran pensador de la Patrística, defendió la fe con la frase 'Creer para [comprender]'.", ans: "comprender", ex: "San Agustín sostenía que la fe cristiana era el punto de partida necesario para iluminar la razón humana y alcanzar el verdadero conocimiento ('Crede ut intelligas'). Esta idea se oponía a la postura de otros pensadores que exigían primero comprender racionalmente para poder creer, y marcó profundamente la filosofía cristiana medieval posterior. Esta síntesis entre fe y razón influiría directamente en pensadores posteriores como Anselmo de Canterbury y, siglos después, en la propia Escolástica medieval." }
        ]
    },
    {
        id: 2,
        title: "Tema 2: Origen y decadencia del Imperio Carolingio",
        riddles: [
            { q: "Noble franco que frenó el avance del islam en la famosa batalla de Poitiers en el 732 d.C.", a: "CARLOS MARTEL", ex: "Como mayordomo de palacio de los francos, Carlos Martel venció a las fuerzas del califato omeya, consolidando el poder de su dinastía y frenando la expansión islámica en Europa central. Esta victoria le valió gran prestigio militar y religioso en toda la cristiandad occidental, y sentó las bases del poder político que después heredarían su hijo Pipino y su nieto Carlomagno. La batalla de Poitiers (o de Tours) del año 732 es considerada por muchos historiadores como un punto de inflexión que detuvo el avance musulmán hacia el norte de Europa." },
            { q: "Rey franco que se alió con el Papa y le cedió tierras dando origen a los Estados Pontificios.", a: "PIPINO EL BREVE", ex: "Pipino el Breve, hijo de Carlos Martel, fue coronado por el Papa Esteban II y le donó los territorios de la península itálica que se convertirían en los Estados Pontificios. Este acuerdo, conocido como la 'Donación de Pipino', selló una alianza estratégica entre la dinastía carolingia y el papado que definiría la política europea durante siglos. Además, Pipino fue el primer rey franco ungido con óleo sagrado por la Iglesia, un ritual que reforzaba la legitimidad divina de su poder monárquico." },
            { q: "Monarca coronado como Emperador de la Cristiandad por el Papa León III en la Navidad del año 800.", a: "CARLOMAGNO", ex: "Carlomagno, hijo de Pipino, expandió las frontiers del reino franco y restauró la idea del Imperio Romano de Occidente en alianza directa con el papado de Roma. Con esta coronación se buscaba restaurar simbólicamente la unidad política y religiosa de Occidente, aunque en la práctica el nuevo imperio dependía en gran medida del apoyo de la nobleza local. Esta coronación, ocurrida el día de Navidad del año 800, es considerada por muchos historiadores el acto fundacional simbólico de la Europa medieval y moderna." },
            { q: "Inspectores imperiales ('enviados del señor') que vigilaban que los nobles cumplieran las leyes.", a: "MISSI DOMINICI", ex: "Los Missi Dominici viajaban en parejas (un noble laico y un clérigo) para auditar las provincias, evitar abuses de poder locales y recuperar tributos para Carlomagno. Su función era esencial para mantener la cohesión de un imperio tan extenso, ya que informaban directamente al emperador sobre la administración de justicia, la recaudación de impuestos y el trato a los campesinos. Su labor de supervisión resultaba esencial en una época sin comunicaciones rápidas, ya que constituían prácticamente los únicos ojos y oídos directos del emperador en los territorios lejanos." },
            { q: "Tratado del año 843 d.C. que dividió definitivamente el gran imperio entre los tres nietos de Carlomagno.", a: "TRATADO DE VERDÚN", ex: "El Tratado de Verdún puso fin a la guerra civil carolingia fragmentando el imperio en tres reinos: Francia Occidental, Lotaringia y Francia Oriental (origen de Alemania). Esta división, motivada por las disputas entre los nietos de Carlomagno, sentó las bases territoriales de lo que con el tiempo se convertiría en Francia, Alemania e Italia. Este tratado, firmado en el año 843, es considerado por muchos historiadores el primer documento que reconoce fronteras políticas similares a las naciones europeas actuales." }
        ],
        fillBlanks: [
            { text: "Carlomagno fijó la capital y la corte de su gran imperio en la ciudad de [Aquisgrán].", ans: "Aquisgrán", ex: "Aquisgrán (hoy Aachen, Alemania) fue elegida por sus famosas aguas termales curativas y su ubicación central óptima para movilizar ejércitos imperiales. Allí, Carlomagno mandó construir su famosa Capilla Palatina y reunió a los intelectuales más destacados de la época para desarrollar la llamada 'Escuela Palatina'. Carlomagno elegió esta ciudad como su residencia predilecta, convirtiéndola en una auténtica capital cultural y política del renaciente imperio de Occidente." },
            { text: "Para controlar y proteger las fronteras de los enemigos, el imperio se dividió en [marcas].", ans: "marcas", ex: "Las marcas eran provincias fronterizas highly militarizadas (como la Marca Hispánica o la Marca Sajona) gobernadas por un marqués con plenos poderes defensivos. Este sistema defensivo permitía reaccionar rápidamente ante invasiones externas, como las de los sarracenos en el sur o los sajones en el norte, sin comprometer la seguridad del corazón del imperio. El marqués al mando de estas provincias fronterizas gozaba de mayor autonomía militar que un conde ordinario, dada la necesidad de tomar decisiones rápidas ante ataques externos." },
            { text: "El emperador entregaba tierras o feudos a los nobles, lo que marcó el origen del [feudalismo].", ans: "feudalismo", ex: "El reparto de feudos y tierras a cambio de lealtad militar personal fragmentó la soberanía real, cediendo el poder a condes, duques y marqueses medievales. Con el tiempo, estos señores locales acumularon tanto poder militar y económico que la autoridad central del rey se fue debilitando progresivamente durante los siglos siguientes. Este proceso de descentralización daría paso, hacia el siglo IX y X, a la consolidación definitiva del sistema feudal como forma dominante de organización política y social en Europa." },
            { text: "El sucesor de Carlomagno fue [Luis el Piadoso], un rey bastante débil que no pudo mantener la unidad.", ans: "Luis el Piadoso", ex: "Luis el Piadoso (Ludovico Pío) se centró más en reformas eclesiásticas y espirituales que en contener las ambiciones sucesorias de sus propios hijos rebeldes. Sus continuas disputas con sus propios hijos por el reparto de la herencia territorial debilitaron gravemente la unidad del imperio y precipitaron su fragmentación definitiva. El propio término 'piadoso' refleja su carácter profundamente religioso, más interesado en cuestiones espirituales y en la reforma monástica que en la gestión política del imperio." },
            { text: "Tras la división del imperio, la zona este (Germania) se unificó en el siglo X formando el Imperio [Germánico].", ans: "Germánico", ex: "El Sacro Imperio Romano Germánico nació formalmente con la coronación de Otón I en el 962 d.C., buscando resucitar la herencia imperial carolingia y romana. Este nuevo imperio se proclamó heredero directo de la tradición carolingia y romana, y llegaría a durar, con diversas transformaciones, hasta principios del siglo XIX. Fue disuelto formalmente en 1806 tras las conquistas napoleónicas, poniendo fin a casi mil años de continuidad institutional heredada de la tradición carolingia." }
        ]
    },
    {
        id: 3,
        title: "Tema 3: El Renacimiento Carolingio",
        riddles: [
            { q: "Gran problema social que sufría la mayoría de la población y que Carlomagno intentó combatir con escuelas.", a: "ANALFABETISMO", ex: "A fines del siglo VIII, incluso la mayoría de la nobleza era incapaz de leer o escribir, por lo que Carlomagno decretó abrir escuelas en iglesias y catedrales. Estas escuelas, ubicadas principalmente en catedrales y monasterios, no solo enseñaban a leer y escribir, sino también nociones básicas de aritmética y canto litúrgico. Esta política educativa impulsada por Carlomagno se considera el primer intento sistemático de extender la enseñanza básica más allá de los muros de los monasterios." },
            { q: "Innovación de escritura que se inventó en el imperio para copiar libros de forma más rápida y legible.", a: "LETRA MINÚSCULA", ex: "La minúscula carolingia introdujo formas redondeadas, separación clara entre palabras y el uso de mayúsculas iniciales, unificando la escritura en toda Europa. Gracias a su claridad y rapidez de escritura, este sistema se convirtió en el modelo base de la tipografía occidental moderna, incluidas muchas de las fuentes que usamos hoy en los ordenadores. Antes de su creación, los textos se escribían casi sin separación entre palabras, lo que dificultaba enormemente la lectura y la copia precisa de los manuscritos." },
            { q: "Talleres de escritura ubicados en los monasterios donde los monjes copiaban manuscritos antiguos a mano.", a: "SCRIPTORIA", ex: "Los scriptoria (o escritorios monásticos) preservaron una cantidad inmensa de obras clásicas latinas y sagradas que de otro modo se habrían perdido en el tiempo. El trabajo en los scriptoria era lento y minucioso, realizado a la luz de velas durante largas jornadas, y muchos monjes copistas dejaron anotaciones personales en los márgenes de los manuscritos. Copiar una sola Biblia completa podía tardar meses o incluso años, por lo que los libros medievales eran objetos extremadamente valiosos y costosos." },
            { q: "Pequeñas ilustraciones y decoraciones a trazos rápidos usadas para adornar los libros sagrados.", a: "MINIATURAS", ex: "Derivadas del uso del pigmento rojo 'minio', las miniaturas eran complejas ilustraciones detalladas que decoraban las letras capitulares de los códices medievales. Estas ilustraciones no solo embellecían los textos, sino que también ayudaban a los fieles analfabetos a comprender visualmente los pasajes bíblicos representados. Elaboradas con pigmentos naturales y, en ocasiones, pan de oro, las miniaturas convertían cada manuscrito en una auténtica obra de arte única e irrepetible." },
            { q: "Capilla palatina de planta octogonal que es considerada la gran obra maestra del arte carolingio.", a: "CAPILLA PALATINA", ex: "La Capilla Palatina de Aquisgrán, de planta central octogonal inspirada en San Vital de Rávena, simbolizaba la unión del poder terrenal del emperador y el divino. En su interior se conserva el trono de mármol donde eran coronados los futuros emperadores del Sacro Imperio, en un gesto que vinculaba su autoridad con la de Carlomagno. Su diseño se inspiró directamente en la basílica de San Vital de Rávena, reflejando la admiración de Carlomagno por el arte y la arquitectura bizantina." }
        ],
        fillBlanks: [
            { text: "Uno de los sabios intelectuales más destacados de la corte imperial fue el inglés [Alcuino de York].", ans: "Alcuino de York", ex: "Alcuino de York fue el director de la Escuela Palatina de Aquisgrán y estructuró las siete artes liberales tradicionales (Trivium y Quadrivium) para la educación medieval. Bajo su dirección, la Escuela Palatina se convirtió en un referente cultural que atrajo a sabios de toda Europa y sentó las bases del renacimiento cultural carolingio. Originario de Inglaterra, Alcuino fue invitado personalmente por Carlomagno para reorganizar el sistema educativo de todo el imperio franco." },
            { text: "El arte carolingio se considera un renacimiento porque mezclaba el arte romano con la influencia [bizantina].", ans: "bizantina", ex: "La influencia artística e intelectual de Bizancio (Constantinopla) aportó técnicas de mosaicos dorados y suntuosidad oriental a la arquitectura carolingia occidental. Este intercambio cultural se intensificó gracias a las relaciones diplomáticas entre la corte de Carlomagno y el Imperio bizantino de Constantinopla. Estos intercambios artísticos se reflejan claramente en el uso de mosaicos dorados y en la planta centralizada de varios edificios religiosos carolingios." },
            { text: "En sus construcciones de piedra, los arquitectos carolingios recuperaron el uso del [arco de medio punto].", ans: "arco de medio punto", ex: "El arco semicircular o de medio punto de origen romano fue rescatado por los constructores carolingios para sostener pesados techos de basílicas de piedra. Esta técnica constructiva, heredada de la arquitectura romana clásica, permitía distribuir mejor el peso de las estructuras y sería la base del posterior estilo románico. Su uso permitió a los constructores carolingios levantar naves más amplias y elevadas que las estructuras de madera predominantes en siglos anteriores." },
            { text: "Los encargados de proteger la cultura y enseñar a leer en esta sociedad rural fueron los [monasterios].", ans: "monasterios", ex: "Ante la ausencia de ciudades grandes, los monasterios operaban como centers autosuficientes que concentraban las únicas bibliotecas y talleres de estudio. Muchos de ellos funcionaban también como hospitales, hospederías para viajeros y centros de producción agrícola, consolidándose como verdaderos núcleos de vida social en el mundo rural medieval. Alrededor de muchos monasterios llegaron a formarse pequeñas aldeas dependientes económicamente de la actividad agrícola y artesanal organizada por la comunidad monástica." },
            { text: "En la actualidad, la Capilla Palatina de Aquisgrán está catalogada como [Patrimonio de la Humanidad].", ans: "Patrimonio de la Humanidad", ex: "Declarada como tal por la UNESCO en 1978, la capilla alberga el trono de mármol de Carlomagno y sus restos mortales como pieza fundacional de Europa occidental. Fue, además, uno de los primeros doce sitios en el mundo en recibir esta distinción, reconociendo su valor histórico y arquitectónico excepcional. Hoy en día, la Catedral de Aquisgrán recibe miles de visitantes cada año interesados en conocer uno de los monumentos mejor conservados del arte carolingio." }
        ]
    },
    {
        id: 4,
        title: "Tema 4: Las Cruzadas y su impacto",
        riddles: [
            { q: "Campañas militares de los reinos cristianos occidentales para arrebatarle Tierra Santa a los musulmanes.", a: "CRUZADAS", ex: "Iniciadas a finales del siglo XI, fueron expediciones militares convocadas por la Iglesia católica bajo la promesa de remisión de los pecados para los guerreros. A lo largo de casi dos siglos se organizaron nueve grandes expediciones, que combinaron motivaciones religiosas genuinas con intereses políticos, comerciales y territoriales de la nobleza europea. Aunque la Primera Cruzada logró conquistar Jerusalén en 1099, las posteriores expediciones fueron perdiendo fuerza hasta la caída definitiva de los territorios cristianos en Oriente en 1291." },
            { q: "Papa de la Iglesia católica que convocó oficialmente la Primera Cruzada en el año 1095.", a: "URBANO II", ex: "Durante el Concilio de Clermont en 1095, el Papa Urbano II pronunció el famoso grito '¡Dios lo quiere!' para exhortar a la nobleza europea a marchar a Oriente. Su discurso tuvo tal impacto que miles de campesinos y caballeros de toda Europa se organizaron rápidamente para emprender el largo y peligroso viaje hacia Jerusalén. Este movimiento popular espontáneo, conocido como la 'Cruzada de los Pobres', partió antes que el ejército oficial y terminó en un desastre militar frente a los turcos." },
            { q: "Famoso rey de Inglaterra que lideró la Tercera Cruzada, también conocida como la de los reyes.", a: "RICARDO CORAZÓN DE LEÓN", ex: "Ricardo I de Inglaterra destacó por sus batallas y su posterior tregua diplomática con el líder musulmán Saladino, la cual permitía el paso de peregrinos a Jerusalén. A pesar de no lograr recuperar Jerusalén, su campaña militar consolidó su fama como uno de los grandes líderes militares medievales de Europa occidental. Curiosamente, Ricardo pasó muy poco tiempo de su reinado en Inglaterra, dedicando la mayor parte de su vida a campañas militares en el extranjero." },
            { q: "Destacado filósofo y médico árabe cuyas obras científicas fueron traducidas y llevadas a Europa.", a: "AVICENA", ex: "Ibn Sina (Avicena) wrote el 'Canon de Medicina', obra que revolucionó el conocimiento médico y farmacéutico del Occidente medieval. Sus escritos fueron utilizados como libros de texto obligatorios en las universidades europeas durante varios siglos, mucho después de su muerte en el siglo XI. Su enfoque combinaba la tradición médica griega de Galeno e Hipócrates con nuevas observaciones clínicas propias, adelantándose en varios siglos a algunos principios de la medicina moderna." },
            { q: "Instrumento de navegación de origen asiático que los europeos adoptaron gracias al comercio con los árabes.", a: "BRÚJULA", ex: "Inventada originalmente en China, la brújula magnetizada revolucionó la navegación oceánica europea y los mapas al permitir orientarse en alta mar. Su llegada a Europa a través de las rutas comerciales mediterráneas transformó por completo la navegación, permitiendo viajes más largos y seguros lejos de la costa. Junto con la pólvora y la imprenta, la brújula es considerada uno de los tres grandes inventos que, según Francis Bacon, transformaron por completo el mundo moderno." }
        ],
        fillBlanks: [
            { text: "El detonante de las Cruzadas ocurrió cuando los musulmanes conquistaron la ciudad de [Jerusalén] en 1076.", ans: "Jerusalén", ex: "La toma de la Ciudad Santa por los turcos selyúcidas dificultó las rutas tradicionales de los peregrinos cristianos, encendiendo el descontento en Europa. La ciudad tenía un enorme valor simbólico para las tres grandes religiones monoteístas, lo que convirtió su control en motivo de conflicto durante siglos. Tras su conquista en 1099, los cruzados fundaron el Reino Latino de Jerusalén, un Estado cristiano que sobrevivió en la región durante casi un siglo." },
            { text: "En lugar de llegar a Tierra Santa, los caballeros de la Cuarta Cruzada terminaron saqueando [Constantinopla].", ans: "Constantinopla", ex: "Desviados por intereses financieros venecianos, los cruzados asediaron y saquearon la capital del Imperio Bizantino cristiano en 1204, fracturando permanentemente la relación entre Oriente y Occidente. Este episodio debilitó gravemente al Imperio bizantino, dejándolo más vulnerable ante los posteriores avances del Imperio otomano dos siglos después. Constantinopla finalmente caería en manos del sultán otomano Mehmet II en 1453, un hecho que muchos historiadores señalan como el fin simbólico de la Edad Media." },
            { text: "Las Cruzadas debilitaron el sistema [feudal] porque muchos nobles murieron o perdieron sus tierras en Oriente.", ans: "feudal", ex: "La desaparición de señores feudales y los gastos de guerra fortalecieron el poder de los reyes, quienes centralizaron de nuevo la autoridad estatal. Muchos campesinos, al ver reducida la autoridad de sus señores locales, comenzaron a establecer relaciones más directas con el poder real, favoreciendo la centralización política. Este fortalecimiento del poder real sentaría las bases de las futuras monarquías autoritarias que dominarían Europa entre los siglos XV y XVIII." },
            { text: "El comercio marítimo y terrestre creció rápidamente debido a la gran demanda europea de seda y [especias].", ans: "especias", ex: "Las especias de Oriente (pimienta, canela, clavo) eran cruciales en Europa para conservar la carne fresca y elaborar medicinas, enriqueciendo a puertos como Venecia. Este comercio impulsó también el desarrollo de nuevas rutas marítimas y contribuyó al auge económico de las repúblicas italianas como Venecia y Génova. La búsqueda de rutas alternativas hacia estas mercancías orientales sería, siglos más tarde, uno de los principales motivos que impulsarían los viajes de exploración transatlánticos." },
            { text: "Todo el intercambio cultural y científico vivido en las Cruzadas preparó el camino para el [Renacimiento europeo].", ans: "Renacimiento europeo", ex: "El contacto directo con textos griegos, la ciencia árabe y la sofisticación de Bizancio sembró la semilla del humanismo y el despertar científico del siglo XV. Bibliotecas, universidades y talleres artísticos comenzaron a redescubrir el legado clásico grecorromano gracias a estas traducciones, alimentando el espíritu humanista que floreció siglos después. Filósofos, médicos y matemáticos árabes como Averroes o Al-Juarismi se convirtieron en referentes obligados dentro de los nuevos planes de estudio universitarios europeos." }
        ]
    },
    {
        id: 5,
        title: "Tema 5: La Inquisición",
        riddles: [
            { q: "Doctrina cristiana que creció en Francia en el siglo XII y que fue considerada tan peligrosa por la Iglesia que motivó la creación de la Inquisición.", a: "CÁTAROS", ex: "Los cátaros o albigenses promovían un dualismo extremo (bien y mal, materia y espíritu) y rechazaban los sacramentos y la jerarquía oficial de la Iglesia católica. Su fuerte implantación en el sur de Francia, especialmente en la región de Occitania, llevó a la Iglesia a organizar la Cruzada Albigense para erradicarlos por la fuerza. Esta cruzada, iniciada en 1209 por orden del papa Inocencio III, provocó una de las persecuciones religiosas internas más sangrientas de toda la Europa medieval." },
            { q: "Bula papal dictada por el papa Lucio III en 1184 que sirvió como base histórica para la creación del Tribunal de la Santa Inquisición.", a: "AD ABOLENDAM", ex: "La bula 'Ad Abolendam' ordenaba a los obispos buscar activamente y castigar la presencia de herejes en sus diócesis, sentando las bases procesales del tribunal. Este documento estableció además sanciones específicas contra quienes protegieran o encubrieran a los herejes, ampliando la responsabilidad más allá del propio acusado. Este documento sentó un precedente jurídico clave, ya que por primera vez se sistematizó a nivel eclesiástico la persecución organizada de la herejía en toda la cristiandad." },
            { q: "Orden religiosa mendicante a la que el papa Gregorio IX encargó especialmente la labor de investigar y juzgar las herejías.", a: "DOMINICOS", ex: "La Orden de Predicadores (Dominicos), célebre por su estricta formación teológica e intelectual, fue la principal encargada de dirigir los tribunales inquisitoriales. Junto a ellos, la Orden Franciscana también participó activamente en la labor inquisitorial, aportando predicadores itinerantes que recorrían pueblos y ciudades enteras. Ambas órdenes mendicantes compartían un profundo compromiso con la predicación pública y la formación teológica rigurosa, cualidades consideradas indispensables para juzgar correctamente los casos de herejía." },
            { q: "Famoso científico perseguido y juzgado por la Inquisición por interpretar el universo de una forma distinta a los dogmas de la fe.", a: "GALILEO GALILEI", ex: "In 1633, Galileo fue procesado por el Santo Oficio y obligado a retractarse públicamente de sus teorías heliocéntricas que demostraban que la Tierra giraba alrededor del Sol. Aunque la leyenda le atribuye la frase 'Y sin embargo, se mueve', no existe evidencia histórica confirmada de que la pronunciara tras su juicio. No fue sino hasta 1992 cuando la Iglesia católica, bajo el papa Juan Pablo II, reconoció oficialmente el error cometido en el proceso contra Galileo." },
            { q: "Túnica o prenda humillante que los condenados por la Inquisición estaban obligados a vestir en público como parte de su castigo.", a: "SAMBENITO", ex: "El sambenito (saco bendito) era una túnica amarilla o negra con aspas o llamas dibujadas que exponía al penitente a la humillación pública perpetua. Los diseños y colores del sambenito varían según la gravedad de la falta cometida, y en algunos casos se colgaban permanentemente en las iglesias como recordatorio público. Llevar esta prenda no solo humillaba al condenado, sino que también marcaba a su familia con un estigma social que podía perdurar por varias generaciones." }
        ],
        fillBlanks: [
            { text: "La inquisición [episcopal] otorgaba a los obispos el poder de juzgar y condenar a los herejes en sus propias diócesis.", ans: "episcopal", ex: "En la fase episcopal, cada obispo local decidía los juicios. Sin embargo, este sistema resultó descentralizado e ineficaz ante las herejías masivas. Este modelo dependía en gran medida de la voluntad y capacidad de cada obispo, por lo que su eficacia variaba enormemente entre una diócesis y otra. Precisamente esta falta de uniformidad fue uno de los principales argumentos que utilizó el papado para justificar la posterior centralización del tribunal bajo su autoridad directa." },
            { text: "El papa Gregorio IX centralizó el control del tribunal en Roma dando origen a la Inquisición [pontificia] a través de la bula Excommunicamus.", ans: "pontificia", ex: "La Inquisición pontificia dependía directamente de la autoridad papal de Roma y usaba jueces especiales e itinerantes independientes de los obispos locales. Estos jueces itinerantes viajaban de ciudad en ciudad aplicando un procedimiento judicial uniforme, lo que dio mayor coherencia y severidad a la persecución de la herejía. A diferencia del modelo episcopal anterior, estos jueces papales actuaban con independencia de los obispos locales y respondían únicamente ante la autoridad de Roma." },
            { text: "En el año 1252, el papa Inocencio IV autorizó oficialmente el uso de la [tortura] para obtener las confessions de los acusados.", ans: "tortura", ex: "Mediante la bula 'Ad extirpanda', se permitió la tortura física de forma regulada (sin derramar sangre ni causar mutilaciones) para conseguir confesiones de herjía. Aun así, en la práctica estas restricciones se incumplieron con frecuencia, generando confesiones forzadas que no siempre reflejaban la verdad de los hechos. Historiadores modernos han señalado que este método probatorio generó numerosos casos de condenas injustas, basadas en confesiones extraídas bajo sufrimiento físico extremo." },
            { text: "El tribunal civil o del Estado era el encargado de ejecutar la pena de muerte en la [hoguera], ya que la Iglesia no lo hacía de manera directa.", ans: "hoguera", ex: "Por el principio eclesiástico de no derramar sangre, los tribunales de la Inquisición 'relajaban' al condenado entregándolo a la justicia civil para su ejecución. Este mecanismo permitía a la Iglesia mantener formalmente su doctrina de misericordia mientras el poder civil ejecutaba las condenas más severas. Este procedimiento, conocido como 'relajación al brazo secular', permitía a la Iglesia sostener que jamás derramaba sangre directamente, delegando la ejecución física en las autoridades civiles." },
            { text: "El terrible miedo generado por el control de la Inquisición terminó frenando el avance [científico] y cultural de Europa durante siglos.", ans: "científico", ex: "La censura de libros ('Index Librorum Prohibitorum') y la persecución a librepensadores retrasaron el desarrollo científico en las naciones católicas del sur de Europa. Muchos pensadores optaron por el exilio o el silencio autoimpuesto para evitar ser acusados de herejía, retrasando así avances que en otras regiones de Europa se desarrollaron con mayor libertad. Países protestantes como Inglaterra u Holanda, libres de este control inquisitorial estricto, se convirtieron en los principales focos de la revolución científica de los siglos XVI y XVII." }
        ]
    },
    {
        id: 6,
        title: "Tema 6: El origen de las universidades medievales",
        riddles: [
            { q: "Fui la cuna del saber en la Edad Media. Empecé siendo un lugar de oración y trabajo para los monjes y terminé convirtiéndome en el origen de las primeras universidades. ¿Qué soy?", a: "MONASTERIO", ex: "Los monasterios funcionaron durante siglos como centros aislados de preservación cultural, copiando manuscritos antiguos a mano y enseñando en sus escuelas monásticas. Su aislamiento geográfico, lejos de las ciudades, les permitió conservar intacto el conocimiento clásico durante los siglos más convulsos de la Alta Edad Media. Gracias a esta labor de conservación, obras de autores clásicos como Cicerón, Virgilio o Aristóteles pudieron sobrevivir hasta ser redescubiertas siglos después." },
            { q: "Soy el término latino que significa «corporación o gremio» y de mí nació la palabra que hoy usamos para los centros de educación superior. ¿Qué término soy?", a: "UNIVERSITAS", ex: "La 'Universitas' medieval era literalmente un gremio o sindicato de estudiantes (como en Bolonia) o de maestros (como en París) que buscaba defender sus derechos. Estas corporaciones tenían autonomía propia para fijar normas internas, exigir el pago de matrículas y otorgar títulos académicos reconocidos en toda la cristiandad. Estas corporaciones también podían declararse en huelga colectiva, trasladando la universidad entera a otra ciudad si sus privilegios no eran respetados por las autoridades locales." },
            { q: "Soy la facultad universitaria medieval que más estudiantes lograba atraer, y servía de base antes de especializarse en Derecho, Medicina o Teología. ¿Qué facultad soy?", a: "ARTE", ex: "La Facultad de Artes Menores enseñaba gramática, lógica y retórica (Trivium) y matemáticas (Quadrivium) como un paso previo obligatorio para los estudios superiores. Solo tras superar esta etapa introductoria los estudiantes podían acceder a las llamadas 'facultades mayores', consideradas de mayor prestigio y complejidad académica. El plan de estudios de esta facultad podía extenderse entre cuatro y seis años, formando una base intelectual sólida antes de la especialización profesional." },
            { q: "Soy la famosa ciudad italiana donde nació una de las primeras universidades medievales, muy reconocida por promover y difundir el primer Código de Derecho Civil. ¿Qué ciudad soy?", a: "BOLONIA", ex: "Establecida hacia 1088, la Universidad de Bolonia se convirtió en el principal centro de estudio del derecho romano y civil de toda Europa. A diferencia de otras universidades europeas, en Bolonia fueron los propios estudiantes quienes organizaron la institución y contrataron a sus maestros, invirtiendo el modelo habitual de gobierno académico. Este modelo estudiantil autogestionado, conocido como el 'modelo bolonio', contrasta con el 'modelo parisino', donde eran los propios maestros quienes controlaban la organización universitaria." },
            { q: "Soy el idioma oficial y único en el que se impartían las clases y se estudiaba el Derecho en las universidades de la Edad Media. ¿Qué idioma soy?", a: "LATÍN", ex: "El latín medieval funcionaba como el 'inglés de la época': una lengua común europea que permitía a estudiantes de España, Alemania o Polonia estudiar juntos sin barreras. El dominio de esta lengua era además un requisito de ingreso indispensable, ya que todos los libros de texto y exámenes orales se realizaban exclusivamente en latín. Este uso exclusivo del latín permitía además la libre circulación de estudiantes y profesores entre distintas universidades europeas sin barreras idiomáticas." }
        ],
        fillBlanks: [
            { text: "El lema benedictino de San Benito de Nursia que organizaba la vida monástica e impulsaba el estudio era «[Ora et labora]».", ans: "Ora et labora", ex: "Significa 'Reza y trabaja'. San Benito obligaba a los monjes a equilibrar la oración espiritual con el trabajo agrícola y la copia escrita de libros antiguos. Esta filosofía de vida convirtió a los monasterios benedictinos en modelos de disciplina, autosuficiencia económica y producción intelectual durante toda la Edad Media. La Regla de San Benito, redactada en el siglo VI, se convirtió en el modelo organizativo seguido por la inmensa mayoría de las órdenes monásticas occidentales posteriores." },
            { text: "La universidad medieval nació originalmente de la asociación de [profesores] y estudiantes que se preparaban en los monasterios.", ans: "profesores", ex: "Al independizarse de las escuelas catedralicias, gremios de maestros y alumnos redactaron estatutos propios y consiguieron privilegios legales directos de reyes y papas. Estos privilegios incluían, entre otros beneficios, la exención de impuestos y el derecho a ser juzgados por tribunales propios en lugar de los tribunales civiles ordinarios. Estos privilegios especiales convirtieron a la comunidad universitaria en un estamento social propio, con derechos y protecciones legales similares a los de otros gremios medievales." },
            { text: "Para pasar de un grado a otro en la universidad medieval, los estudiantes no hacían exámenes escritos, sino un examen [oral].", ans: "oral", ex: "Los exámenes consistían en debates públicos y lecturas de textos donde el alumno defendía oralmente su postura teológica o jurídica ante un jurado de maestros. Este formato de evaluación, conocido como 'disputatio', ponía a prueba tanto los conocimientos del estudiante como su capacidad de argumentación lógica frente a un tribunal exigente. Superar exitosamente estas disputas públicas era un requisito indispensable para obtener el título de maestro y poder ejercer la docencia de forma independiente." },
            { text: "Durante la Edad Media, los [monjes] eran prácticamente los únicos que sabían leer y escribir, actuando como guardianes del saber.", ans: "monjes", ex: "La gran masa campesina y la propia nobleza eran analfabetas, convirtiendo a la Iglesia y a su clero regular en los únicos monopolizadores de la alfabetización activa. Esta situación les otorgaba un enorme poder cultural y social, ya que controlaban prácticamente todo el acceso a los textos religiosos, legales y científicos disponibles. Solo hacia finales de la Edad Media, con la aparición de las universidades laicas, este monopolio educativo del clero comenzó a debilitarse progresivamente." },
            { text: "Las universidades medievales se especializaron en cuatro áreas o facultades: Arte, Derecho, Medicina y [Teología].", ans: "Teología", ex: "La Teología (el estudio de Dios y las escrituras) era considerada la reina de las ciencias medievales y la especialización académica de mayor prestigio. Estudiar esta disciplina requería años previos de formación en Artes, por lo que solo llegaban a completarla los estudiantes más dedicados y con mayores recursos económicos. Alcanzar el grado de maestro en Teología podía tomar hasta quince años de estudio, superando ampliamente la duración de cualquier otra facultad medieval." }
        ]
    },
    {
        id: 7,
        title: "Tema 7: Expansión cultural, artística y científica",
        riddles: [
            { q: "Soy el método filosófico ampliamente discutido en las universidades que buscaba conciliar y debatir la relación entre la fe y la razón. ¿Qué método soy?", a: "ESCOLÁSTICO", ex: "La Escolástica utilizaba la lógica racional aristotélica para analizar y sustentar los dogmas de las sagradas escrituras, teniendo a Santo Tomás de Aquino como referente. Este método se basaba en plantear una pregunta, exponer los argumentos a favor y en contra ('sic et non'), y finalmente ofrecer una síntesis racional respaldada por la autoridad de las Escrituras. Esta metodología alcanzó su máxima expresión en la obra 'Summa Theologiae' de Santo Tomás de Aquino, considerada la síntesis más completa del pensamiento escolástico medieval." },
            { q: "Soy la disciplina científica medieval que buscaba la transformación de la materia y que terminó convirtiéndose en la precursora de la química moderna. ¿Qué soy?", a: "ALQUIMIA", ex: "La alquimia combinaba saberes prácticos de metalurgia con filosofía hermética, buscando la transmutación de metales en oro y el elixir de la juventud eterna. Aunque muchos de sus objetivos resultaron irrealizables, sus experimentos prácticos con sustancias y procesos de laboratorio aportaron técnicas fundamentales para el posterior desarrollo del método científico. Muchos alquimistas medievales desarrollaron instrumentos y procedimientos de laboratorio, como la destilación y la sublimación, que perdurarían como herramientas esenciales de la química moderna." },
            { q: "Tengo forma de cruz latina, muros gruesos de piedra, pocas ventanas y arcos de medio punto. Soy el estilo arquitectónico de los siglos XI y XII. ¿Qué arte soy?", a: "ROMÁNICO", ex: "El arte Románico floreció en las rutas de peregrinaje rurales de Europa occidental, caracterizándose por templos macizos de aspecto militar y místico. Su expansión estuvo estrechamente ligada al auge de las rutas de peregrinación, como el Camino de Santiago, a lo largo del cual se construyeron numerosas iglesias y monasterios de este estilo. Sus muros gruesos, ventanas pequeñas y espacios en penumbra buscaban transmitir una atmósfera de recogimiento espiritual y protección frente a un mundo exterior percibido como hostil." },
            { q: "Soy la torre octogonal que se sitúa sobre el crucero de las iglesias románicas y sirvo para realzar y cubrir la bóveda. ¿Qué elemento soy?", a: "CIMBORRIO", ex: "El cimborrio destaca exteriormente sobre el tejado en la intersección de la nave principal y la transversal (crucero), sirviendo para dotar de luz y altura al altar. Además de su función structural, simbolizaba la conexión entre lo terrenal y lo divino, dejando entrar la luz natural directamente sobre el altar mayor. Con el paso del tiempo, este elemento arquitectónico evolucionaría hacia las grandes cúpulas y linternas que caracterizarían los templos góticos y renacentistas posteriores." },
            { q: "Así se les llamaba a las esculturas y pinturas románicas, debido a que su función principal era enseñar la Biblia a una población que no sabía leer. Éramos auténticas 'biblias en [piedra]'.", a: "PIEDRA", ex: "El término 'biblias en piedra' alude a los portales tallados donde los campesinos analfabetos observaban escenas del Apocalipsis y la Redención bíblica de forma gráfica. Estos relieves y esculturas se ubicaban estratégicamente en las fachadas y portadas, los primeros puntos de contacto visual de los fieles al ingresar al templo. Escenas como el Juicio Final o la Pasión de Cristo se repetían con frecuencia en estos relieves, reforzando visualmente los mensajes morales transmitidos por el clero." }
        ],
        fillBlanks: [
            { text: "A partir del siglo XI, la literatura medieval se expande gracias a las primeras manifestaciones en lenguas [romances], vernáculas y castellanas.", ans: "romances", ex: "La fragmentación del latín vulgar dio origen a lenguas vernáculas locales (romances) como el castellano, el francés o el italiano, popularizadas mediante cantares de gesta. Los primeros textos literarios en estas lenguas, como los cantares de gesta, narraban hazañas heroicas y fueron transmitidos oralmente por juglares antes de ser puestos por escrito. El 'Cantar de Mio Cid', compuesto en castellano medieval hacia el siglo XII, es considerado una de las primeras y más importantes obras literarias en lengua romance." },
            { text: "El médico Andrés Vesalio destacó en la época por sus grandes aportes al estudio de la [anatomía] humana.", ans: "anatomía", ex: "Con la disección directa de cadáveres, Vesalio refutó teorías médicas obsoletas que se venían repitiendo sin contrastar desde el Imperio Romano (Galeno). Su obra más influyente, 'De Humani Corporis Fabrica', publicada en 1543, incluía ilustraciones detalladas que revolucionaron la enseñanza médica en toda Europa. Vesalio corrigió más de doscientos errores presentes en los textos médicos tradicionales, basando sus conclusiones en la observación directa y no solo en la autoridad de los textos antiguos." },
            { text: "Las iglesias románicas tenían techos construidos con bóvedas de [cañón] y arcos de medio punto heredados de los romanos.", ans: "cañón", ex: "La bóveda de cañón corrido ejercía un enorme empuje lateral hacia afuera, obligando a los arquitectos a diseñar muros extremadamente gruesos y sin ventanas grandes. Para compensar este empuje, los arquitectos añadían contrafuertes exteriores y reducían al mínimo las aberturas, lo que otorgaba a los templos románicos su característico aspecto sobrio y fortificado. Con el tiempo, la búsqueda de mayor luminosidad interior impulsaría el desarrollo de nuevas soluciones estructurales, como la bóveda de crucería característica del posterior estilo gótico." },
            { text: "La escultura románica no buscaba la realidad, sino mover el espíritu a través del [simbolismo], mostrando rigidez y frontalidad.", ans: "simbolismo", ex: "La transformación de las proporciones en el románico no era impericia, sino una elección estética para primar el mensaje religioso y espiritual por encima del naturalismo físico. Las figuras solían representarse con proporciones alteradas o desmesuradas según su importancia jerárquica dentro de la escena religiosa representada. Esta técnica, conocida como 'jerarquía de tamaños', hacía que Cristo o la Virgen aparecieran considerablemente más grandes que los demás personajes secundarios de la composición." },
            { text: "Las esculturas exentas o tallas de madera policromada románicas representaban a la Virgen con el Niño o a Cristo crucificado, el cual siempre aparecía [vestido].", ans: "vestido", ex: "A diferencia del Cristo realista posterior, el crucificado románico se representaba vestido con túnica larga ('Majestad'), coronado como rey impasible e inmune al dolor humano. Esta representación, conocida como 'Cristo en Majestad', buscaba transmitir triunfo y divinidad más que sufrimiento humano, algo que cambiaría radicalmente en el arte gótico posterior. En el gótico, en cambio, el crucificado comenzaría a representarse semidesnudo y visiblemente doliente, reflejando una sensibilidad religiosa mucho más humana y emotiva." }
        ]
    }
];

// Variables globales para el juego
let globalScore = 0;
let currentTopicIdx = 0;
let activeQuestions = [];
let currentQuestionIdx = 0;
let sessionAnswers = {}; 
let roundScore = 0;
let currentStreak = 0; // Contador de racha de aciertos
let juegosCompletados = new Set();
let roundHasErrors = false;

// Datos de Medallas / Logros
const badgesData = [
  { id: 'first_win', title: 'Primeros Pasos', desc: 'Completa tu primer juego con 100 puntos.', icon: '🌱', key: 'badge_first_win' },
  { id: 'perfect_run', title: 'Mente Imparable', desc: 'Resuelve un juego completo a la primera sin cometer errores.', icon: '⚡', key: 'badge_perfect_run' },
  { id: 'debate_master', title: 'Gran Debatiente', desc: 'Publica al menos un comentario en los foros de debate.', icon: '💬', key: 'badge_debate_master' },
  { id: 'critic', title: 'Crítico Histórico', desc: 'Valora 3 o más temas con estrellas.', icon: '⭐', key: 'badge_critic' },
  { id: 'all_clear', title: 'Maestro de la Historia', desc: 'Completa exitosamente los 7 juegos de la plataforma.', icon: '👑', key: 'badge_all_clear' }
];

// =========================================================================
// 2. INICIALIZACIÓN
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    cargarProgresoCompletados();
    initDebates();
    initRatings();
    renderBadges();

    const btnOpenFeedback = document.getElementById('btn-open-feedback');
    if (btnOpenFeedback) {
        btnOpenFeedback.addEventListener('click', () => {
            const modal = document.getElementById('feedbackModal');
            if(modal) modal.style.display = 'flex';
        });
    }

    const btnCloseFeedbackX = document.getElementById('btn-close-feedback-x');
    const btnCloseFeedbackCancel = document.getElementById('btn-close-feedback-cancel');
    if (btnCloseFeedbackX) btnCloseFeedbackX.addEventListener('click', closeFeedbackModal);
    if (btnCloseFeedbackCancel) btnCloseFeedbackCancel.addEventListener('click', closeFeedbackModal);

    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('¡Gracias por tu comentario! Ha sido enviado correctamente.');
            closeFeedbackModal();
            feedbackForm.reset();
        });
    }
});

function closeFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    if(modal) modal.style.display = 'none';
}

function toggleTopic(topicId) {
    const card = document.getElementById(topicId);
    if (card) {
        card.classList.toggle('open');
    }
}

// =========================================================================
// 3. UTILERÍAS
// =========================================================================
function cleanString(str) {
    return str.trim()
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function generateOptions(correctAnswer, pool, count = 4) {
    let options = new Set([correctAnswer]);
    const filteredPool = pool.filter(item => item !== correctAnswer);
    const shuffledPool = shuffleArray(filteredPool);
    
    for(let i = 0; i < shuffledPool.length && options.size < count; i++) {
        options.add(shuffledPool[i]);
    }
    return shuffleArray(Array.from(options));
}

// =========================================================================
// 4. LÓGICA DEL JUEGO INTERACTIVO
// =========================================================================
function openLocalGame(temaNumero) {
    const index = temaNumero - 1;
    if (gameData[index]) {
        openGameModal(gameData[index].title);
    }
}

function openGameModal(topicName) {
    const titleEl = document.getElementById('modalTopicName');
    if (titleEl) titleEl.textContent = topicName;
    
    const matchedIdx = gameData.findIndex(t => t.title === topicName || t.title.includes(topicName));
    if (matchedIdx !== -1) {
        currentTopicIdx = matchedIdx;
    }

    const topic = gameData[currentTopicIdx];
    let allQuestions = [];
    const allTopicRiddleAnswers = topic.riddles.map(r => r.a);

    topic.riddles.forEach((riddle, rIdx) => {
        allQuestions.push({
            type: 'riddle',
            subIdx: rIdx,
            q: riddle.q,
            a: riddle.a,
            options: generateOptions(riddle.a, allTopicRiddleAnswers),
            qKey: `t${topic.id}-r${rIdx}`,
            ex: riddle.ex 
        });
    });

    topic.fillBlanks.forEach((phrase, fIdx) => {
        allQuestions.push({
            type: 'fill',
            subIdx: fIdx,
            q: phrase.text.replace(/\[.*?\]/, "___________"),
            a: phrase.ans,
            fullText: phrase.text,
            qKey: `t${topic.id}-f${fIdx}`,
            ex: phrase.ex 
        });
    });

    activeQuestions = shuffleArray(allQuestions);
    sessionAnswers = {}; 
    currentQuestionIdx = 0;
    roundScore = 0; 
    currentStreak = 0;
    roundHasErrors = false;
    
    renderActiveQuestion();
    const modal = document.getElementById('gameModal');
    if(modal) modal.classList.add('active');
}

function renderActiveQuestion() {
    if (!activeQuestions || activeQuestions.length === 0) return;
    
    const q = activeQuestions[currentQuestionIdx];
    const isAnswered = q.qKey in sessionAnswers;
    const sessionResult = sessionAnswers[q.qKey];
    const container = document.getElementById('modal-questions-list');
    if (!container) return;
    
    const progressPercent = ((currentQuestionIdx + 1) / activeQuestions.length) * 100;

    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.width = `${progressPercent}%`;
    
    const progressText = document.getElementById('progress-text');
    if (progressText) {
        progressText.innerHTML = `Actividad ${currentQuestionIdx + 1} de ${activeQuestions.length} | <strong>Puntaje: ${roundScore} / 100 pts</strong>`;
    }

    let questionTextHtml = '';
    let actionAreaHtml = '';

    if (q.type === 'riddle') {
        // En adivinanzas sí se muestra el enunciado principal arriba
        questionTextHtml = `<div class="question-text">${q.q}</div>`;

        let optionsHtml = '';
        q.options.forEach((opt) => {
            const isBtnCorrect = opt === q.a;
            let extraClass = '';
            
            if (isAnswered) {
                if (isBtnCorrect) {
                    extraClass = 'selected-correct';
                } else if (sessionResult.userVal === opt && !sessionResult.success) {
                    extraClass = 'selected-incorrect';
                }
            }
            
            optionsHtml += `
                <button class="option-btn ${extraClass}" 
                        ${isAnswered ? 'disabled' : ''} 
                        onclick="evaluateRiddleOption(this, '${opt.replace(/'/g, "\\'")}', '${q.a.replace(/'/g, "\\'")}', '${q.qKey}')">
                    ${opt}
                </button>
            `;
        });
        actionAreaHtml = `<div class="options-grid">${optionsHtml}</div>`;
    } else {
        // En tipo 'fill' se omite el questionTextHtml para evitar duplicar el enunciado
        questionTextHtml = '';

        const topic = gameData[currentTopicIdx];
        const allAnswersPool = topic.fillBlanks.map(f => f.ans);
        const optionsPool = generateOptions(q.a, allAnswersPool, 4);
        
        let blanksHtml = '';
        if (isAnswered) {
            blanksHtml = `<span class="filled-block">${sessionResult.userVal}</span>`;
        } else {
            blanksHtml = `<span class="blank-drop-zone" id="drop-${q.qKey}">[ _______ ]</span>`;
        }

        let dynamicPhraseHtml = q.fullText.replace(/\[.*?\]/, blanksHtml);

        let blocksHtml = '';
        if (!isAnswered) {
            optionsPool.forEach(opt => {
                blocksHtml += `
                    <button class="word-block" onclick="selectWordBlock('${q.qKey}', '${opt.replace(/'/g, "\\'")}', '${q.a.replace(/'/g, "\\'")}')">
                        📦 ${opt}
                    </button>
                `;
            });
        }

        actionAreaHtml = `
            <div class="fill-blocks-container">
                <div class="phrase-target-box">${dynamicPhraseHtml}</div>
                <p class="instruction-hint">Haz clic en el bloque de abajo que complete correctamente la frase:</p>
                <div class="word-blocks-pool">
                    ${blocksHtml}
                </div>
            </div>
        `;
    }

    let streakHtml = '';
    if (currentStreak > 1) {
        streakHtml = `<div class="streak-container">🔥 ¡Racha de Aciertos: x${currentStreak}! (+Puntos extra)</div>`;
    }

    let dialogueHtml = '';
    if (isAnswered) {
        const titleText = sessionResult.success ? "¡Correcto! Excelente deducción." : "No es correcto. ¡Sigue intentando!";
        const titleClass = sessionResult.success ? "correct" : "incorrect";
        const avatarEmoji = sessionResult.success ? "🎉" : "🧐";
        
        dialogueHtml = `
            <div class="dialogue-wrapper">
                <img src="${RUTA_IMAGEN_PERSONAJE}" alt="Personaje Histórico" class="dialogue-avatar" onerror="this.src='./logo/logohist.png'">
                <div class="dialogue-bubble">
                    <div class="feedback-title ${titleClass}">${avatarEmoji} ${titleText}</div>
                    <div class="feedback-explanation">
                        <strong>Explicación:</strong> ${q.ex}
                    </div>
                </div>
            </div>
        `;
    }

    const badgeText = q.type === 'riddle' ? 'Adivinanza Histórica' : 'Completar Espacio con Bloques';
    const badgeClass = q.type === 'riddle' ? 'badge-riddle' : 'badge-fill';

    const isFirst = currentQuestionIdx === 0;
    const isLast = currentQuestionIdx === activeQuestions.length - 1;

    container.innerHTML = `
        <div class="question-card type-${q.type} ${isAnswered ? (sessionResult.success ? 'glow-card' : 'shake-card') : ''}">
            ${streakHtml}
            <span class="question-badge ${badgeClass}">${badgeText}</span>
            ${questionTextHtml}
            ${actionAreaHtml}
            ${dialogueHtml}
        </div>
        <div class="game-modal-navigation">
            <button class="nav-btn" ${isFirst ? 'disabled' : ''} onclick="changeQuestion(-1)">← Anterior</button>
            ${isLast ? 
                `<button class="nav-btn btn-next" ${!isAnswered ? 'disabled' : ''} onclick="finishGameRound()">Finalizar Juego 🏆</button>` : 
                `<button class="nav-btn btn-next" ${!isAnswered ? 'disabled' : ''} onclick="changeQuestion(1)">Siguiente →</button>`
            }
        </div>
    `;
}

function processAnswerResult(isCorrect) {
    if (isCorrect) {
        currentStreak++;
        roundScore += 10;
        playSound('correct');
        triggerConfetti();
    } else {
        currentStreak = 0;
        roundHasErrors = true;
        playSound('wrong');
    }
}

function evaluateRiddleOption(btnEl, selectedOption, correctAnswer, qKey) {
    const isCorrect = selectedOption === correctAnswer;
    processAnswerResult(isCorrect);

    sessionAnswers[qKey] = {
        userVal: selectedOption,
        success: isCorrect
    };

    renderActiveQuestion();
}

function selectWordBlock(qKey, selectedWord, correctAnswer) {
    const isCorrect = cleanString(selectedWord) === cleanString(correctAnswer);
    processAnswerResult(isCorrect);

    sessionAnswers[qKey] = {
        userVal: selectedWord,
        success: isCorrect
    };

    renderActiveQuestion();
}

function changeQuestion(delta) {
    const newIdx = currentQuestionIdx + delta;
    if (newIdx >= 0 && newIdx < activeQuestions.length) {
        currentQuestionIdx = newIdx;
        renderActiveQuestion();
    }
}

function finishGameRound() {
    const currentTopic = gameData[currentTopicIdx];
    registrarFinDeJuego(currentTopic.id, roundScore);

    playSound('win');
    triggerConfetti();

    if (roundScore === 100 && !roundHasErrors) {
        unlockBadge('badge_perfect_run');
    }

    alert(`¡Has completado el juego de "${currentTopic.title}"!\nPuntaje final: ${roundScore} / 100 pts.`);
    closeModal();
}

function closeModal() {
    const modal = document.getElementById('gameModal');
    if(modal) modal.classList.remove('active');
}

function closeGameModal(event) {
    if (event.target.id === 'gameModal') {
        closeModal();
    }
}

// =========================================================================
// 5. NAVEGACIÓN Y CONTADOR
// =========================================================================
function cargarProgresoCompletados() {
    const guardados = localStorage.getItem("juegosCompletados");
    if (guardados) {
        juegosCompletados = new Set(JSON.parse(guardados));
    }
    actualizarContadorUI();
}

function actualizarContadorUI() {
    const contadorElemento = document.getElementById("completed-games-num");
    if (contadorElemento) {
        contadorElemento.textContent = `${juegosCompletados.size} / 7`;
    }
}

function registrarFinDeJuego(temaId, puntajeFinal) {
    if (puntajeFinal >= 100) {
        juegosCompletados.add(temaId);
        localStorage.setItem("juegosCompletados", JSON.stringify(Array.from(juegosCompletados)));
        actualizarContadorUI();
        
        unlockBadge('badge_first_win');

        if (juegosCompletados.size === 7) {
            unlockBadge('badge_all_clear');
            setTimeout(() => {
                alert("¡Increíble logro! Has completado con éxito el 100% de los juegos de HistoGame. 🏆");
            }, 600);
        }
    }
}

// =========================================================================
// 6. VALORACIÓN POR ESTRELLAS
// =========================================================================
function initRatings() {
    const ratings = JSON.parse(localStorage.getItem('histoRatings') || '{}');
    for (let i = 1; i <= 7; i++) {
        if (ratings[i]) {
            updateStarsUI(i, ratings[i]);
        }
    }
}

function rateTopic(topicId, stars) {
    let ratings = JSON.parse(localStorage.getItem('histoRatings') || '{}');
    ratings[topicId] = stars;
    localStorage.setItem('histoRatings', JSON.stringify(ratings));
    updateStarsUI(topicId, stars);

    if (Object.keys(ratings).length >= 3) {
        unlockBadge('badge_critic');
    }
}

function updateStarsUI(topicId, stars) {
    const container = document.querySelector(`.rating-container[data-topic-id="${topicId}"]`);
    if (!container) return;

    const starEls = container.querySelectorAll('.star');
    starEls.forEach((star, idx) => {
        if (idx < stars) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });

    const scoreEl = document.getElementById(`rating-score-${topicId}`);
    if (scoreEl) {
        scoreEl.textContent = `(${stars}.0)`;
    }
}

// =========================================================================
// 7. FORO DE DEBATES
// =========================================================================
function initDebates() {
    for (let i = 1; i <= 7; i++) {
        renderDebateComments(i);
    }
}

function getDebateComments(topicId) {
    const allDebates = JSON.parse(localStorage.getItem('histoDebates') || '{}');
    return allDebates[topicId] || [];
}

function addDebateComment(topicId) {
    const authorInput = document.getElementById(`debate-author-${topicId}`);
    const textInput = document.getElementById(`debate-text-${topicId}`);

    if (!authorInput || !textInput) return;

    const author = authorInput.value.trim() || 'Estudiante Anónimo';
    const text = textInput.value.trim();

    if (!text) {
        alert('Por favor escribe un comentario antes de publicar.');
        return;
    }

    const newComment = {
        author: author,
        text: text,
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    };

    let allDebates = JSON.parse(localStorage.getItem('histoDebates') || '{}');
    if (!allDebates[topicId]) allDebates[topicId] = [];
    allDebates[topicId].push(newComment);

    localStorage.setItem('histoDebates', JSON.stringify(allDebates));

    textInput.value = '';
    renderDebateComments(topicId);

    unlockBadge('badge_debate_master');
}

function renderDebateComments(topicId) {
    const container = document.getElementById(`comments-${topicId}`);
    if (!container) return;

    const comments = getDebateComments(topicId);
    if (comments.length === 0) {
        container.innerHTML = `<p style="font-size:0.8rem; color:#888; font-style:italic;">Aún no hay comentarios. ¡Sé el primero en iniciar el debate!</p>`;
        return;
    }

    container.innerHTML = comments.map(c => `
        <div class="comment-card">
            <span class="comment-date">${c.date}</span>
            <div class="comment-author">${c.author}</div>
            <div class="comment-text">${c.text}</div>
        </div>
    `).join('');
}

// =========================================================================
// 8. LOGROS Y MEDALLAS
// =========================================================================
function unlockBadge(badgeKey) {
    localStorage.setItem(badgeKey, 'true');
    renderBadges();
}

function renderBadges() {
    const container = document.getElementById('badges-container');
    if (!container) return;

    container.innerHTML = badgesData.map(b => {
        const isUnlocked = localStorage.getItem(b.key) === 'true';
        return `
            <div class="badge-card ${isUnlocked ? 'unlocked' : ''}">
                <div class="badge-icon">${b.icon}</div>
                <div class="badge-title">${b.title}</div>
                <div class="badge-desc">${b.desc}</div>
                <span class="badge-status">${isUnlocked ? 'Desbloqueado ✓' : 'Bloqueado 🔒'}</span>
            </div>
        `;
    }).join('');
}

// =========================================================================
// 9. GESTIÓN DEL MODAL PDF
// =========================================================================
function openPdfModal(pdfPath) {
    const viewer = document.getElementById('pdfViewer');
    const title = document.getElementById('pdfModalTitle');
    
    if (viewer) viewer.src = pdfPath; 
    
    const filename = pdfPath.split('/').pop();
    if (title) title.textContent = `Visualizando: ${filename}`;
    
    const pdfModal = document.getElementById('pdfModal');
    if (pdfModal) pdfModal.style.display = 'flex';
}

function closePdfModal(event) {
    if (!event || event.target.id === 'pdfModal') {
        const modal = document.getElementById('pdfModal');
        const viewer = document.getElementById('pdfViewer');
        
        if (modal) modal.style.display = 'none';
        if (viewer) viewer.src = ''; 
    }
}

// Cerrar modales con la tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePdfModal(null);
        closeModal();
        closeFeedbackModal();
    }
});

// =========================================================================
// 10. SISTEMA DE GUÍA INTERACTIVA (HISTOGAME TOUR)
// =========================================================================
let currentTourPage = 1;

const tourPagesData = {
  1: {
    title: "Bienvenido a HistoGame",
    text: "¡Bienvenido!<br><br>Esta es una pequeña guía interactiva diseñada para ayudarte a conocer el funcionamiento de la plataforma. En pocos pasos aprenderás cómo navegar por la página y aprovechar todas las herramientas disponibles para mejorar tu aprendizaje.",
    img: "./logo/logohist.png"
  },
  2: {
    title: "Banco de temas",
    text: "En esta sección encontrarás el banco de temas disponibles para estudiar.<br><br>Cada tema incluye un breve resumen o descripción para que conozcas el contenido que se abordará antes de comenzar. Simplemente selecciona el tema que desees explorar para desplegar sus opciones.",
    img: "/imagenes/2.jpeg"
  },
  3: {
    title: "Botón Contenido",
    text: "Cada tema posee el botón Contenido.<br><br>Al hacer clic sobre él se abrirá el material de estudio correspondiente, donde podrás revisar toda la información necesaria antes de realizar las actividades.<br><br>Te recomendamos leer el contenido completo antes de jugar.",
    img: "/imagenes/3.jpeg"
  },
  4: {
    title: "Juega y Aprende",
    text: "Después de estudiar el contenido podrás presionar el botón Juega y Aprende.<br><br>Se abrirá un juego interactivo relacionado con el tema revisado, permitiéndote reforzar tus conocimientos de una manera divertida y dinámica.",
    img: "/imagenes/4.jpeg"
  },
  5: {
    title: "¡Muchas gracias!",
    text: "Gracias por preferir nuestra plataforma HistoGame.<br><br>Esperamos que esta herramienta contribuya a fortalecer tu aprendizaje de una manera interactiva y entretenida.<br><br>¡Te deseamos mucho éxito en tu proceso de aprendizaje!",
    img: "https://www.filosofia.org/000/platon01.jpg"
  }
};

function updateTourDOM() {
  const page = tourPagesData[currentTourPage];
  const contentView = document.getElementById("tour-content-view");
  
  contentView.style.opacity = 0;
  contentView.style.transform = "translateY(5px)";
  
  setTimeout(() => {
    document.getElementById("tour-title").innerText = page.title;
    document.getElementById("tour-text").innerHTML = page.text;
    document.getElementById("tour-img").src = page.img;
    document.getElementById("tour-progress").innerText = `Página ${currentTourPage} de 5`;

    const btnPrev = document.getElementById("btn-tour-prev");
    const btnNext = document.getElementById("btn-tour-next");
    const btnSkip = document.getElementById("btn-tour-skip");

    if (currentTourPage === 1) {
      btnPrev.disabled = true;
      btnNext.style.display = "inline-block";
      btnSkip.innerText = "Omitir";
    } else if (currentTourPage === 5) {
      btnPrev.disabled = false;
      btnNext.style.display = "none";
      btnSkip.innerText = "Cerrar";
    } else {
      btnPrev.disabled = false;
      btnNext.style.display = "inline-block";
      btnSkip.innerText = "Omitir";
    }

    contentView.style.opacity = 1;
    contentView.style.transform = "translateY(0)";
  }, 180);
}

function navigateTour(step) {
  const targetPage = currentTourPage + step;
  if (targetPage >= 1 && targetPage <= 5) {
    currentTourPage = targetPage;
    updateTourDOM();
  }
}

function openHelpModal() {
  currentTourPage = 1; 
  updateTourDOM();
  const modal = document.getElementById("helpModal");
  modal.style.display = "flex";
}

function closeHelpModal(event) {
  if (event && event.target !== document.getElementById("helpModal")) return;
  
  const modal = document.getElementById("helpModal");
  modal.style.display = "none";
}