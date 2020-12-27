var apiKey = "Obtenha sua api key em: https://openweathermap.org/current";
var nome = "Nome da Assistente";
var lat = "0";
var lon = "0";
var ready = false; // Torna-se true quando conseguimos obter a latitude e logintude
var ouvinte = null; // Não implementado. Mas seria a variável que guardaria o nome do usuário com o qual a assistente conversa
var answer = "";
var trusted = 60; // Percentual de combinações para ele prosseguir com alguma função. Quando o valor for 100 a frase deve ser exatamente igual a descrita.
var knowledge = {
    // POSSÍVEIS COMANDOS PARA DISPARAR AS FUNÇÕES
    "que horas são": getHour,
    "que horas são agora": getHour,
    "que hora é": getHour,
    "que hora é agora": getHour,
    "horas": getHour,
    "horário":getHour,
    "qual o horário":getHour,
    "que horas são essa":getHour,
    "qual o seu nome":getName,
    "como se chama":getName,
    "nome":getName,
    "me diz seu nome":getName,
    "diga-me seu nome":getName,
    "como você se chama":getName,
    "como tu te chamas":getName,
    "como posso te chamar":getName,
    "como devo te chamar":getName,
    "seu nome é":getName,
    "você pode me dizer seu nome":getName,
    "poderia me dizer seu nome":getName,
    "quem é você":getName,
    "como é o seu nome":getName,
    "qual a sua graca":getName,
    "qual te chamas":getName,
    "como se chama":getName,
    "conte-me sobre o tempo":getWeather,
    "fale-me sobre o tempo":getWeather,
    "como está o tempo":getWeather,
    "me dê informações sobre o tempo":getWeather,
    "forneça-me informações sobre o tempo":getWeather,
    "vai chover hoje":getWeather,
    "chances de chuva":getWeather,
    "tempo":getWeather,
    "como está o dia":getWeather,
    "como está a noite": getWeather,
    "valor do dólar": getDolar,
    "qual valor do dólar hoje": getDolar,
    "qual valor do dólar": getDolar,
    "dólares em reais": getDolar,
    "dólar": getDolar,
    "quanto vale um dólar": getDolar,
    "quanto custa um dólar": getDolar,
    "dólar hoje": getDolar,
    "qual a cotação do dólar hoje": getDolar,
    "cotação do dólar hoje": getDolar,
}

    // FUNÇÃO INICIAL DE CONFIGURAÇÃO
    function init(){
    var watchID = navigator.geolocation.getCurrentPosition(
        position => {
            lat = position.coords.latitude,
            lon = position.coords.longitude;
          }, (e) => {
            if(e.code == 1){
                alert("Você precisa permitir a localização!")
            }
          });
        ready = true;
    }

    // FUNÇÃO QUE ALTERA O VALOR DA VARIÁVEL answer E GERAR UM EFEITO PARA INDICAR QUE O BOTÃO OUVIR DEVE SER CLICADO
    function newAnswer(txt){
        answer = txt;
        document.querySelector('#listenBtn').style.backgroundPosition = "left center";
        document.querySelector('#listenBtn').setAttribute("class","blob green");
        document.querySelector("#speaking").style.display = "block";
        setTimeout(() => {
            document.querySelector('#listenBtn').setAttribute("class","blob");
        },6000);
    }

    // FAZ OS CÁLCULOS BASEADO NA VARIÁVEL trusted PASSADA NO INÍCIO DO CÓDIGO
    function whatToDo(txt){
        document.querySelector(".heardText").innerText = txt;
        var k = knowledge;
        // CREATE AN ARRAY THAT RECEIVED THE WORDS OF "TXT"
        var received = txt.split(' '); // ARRAY
        // Transform in received indexes in lowercase
        for(var r in received){
            received[r] = received[r].toLowerCase();
        }

        // CREATE A COUNTER TO CALCULATE PERCENTAGE OF MATCH
        var timematches = 0; 
        // LIST INDEX OF OBJ
        for(var input in k){
            // CREATE AN ARRAY THAT RECEIVED THE WORDS OF "INPUT"
            var wordlist = input.split(' '); // ARRAY
            // LIST ARRAY RECEIVED
            for(var word of received){
                if(wordlist.indexOf(word.toLowerCase()) != -1){
                    timematches++;
                }
            }

            var counting = (timematches/received.length) * 100;
            if(counting >= trusted){
                console.log(input)
                k[input]();
                return true;
            }else{
                timematches = 0;
            } 
        }
        newAnswer("Desculpe, mas eu não consigo responder ao que você disse!"); // RESPOSTA PADRÃO QUANDO NÃO HÁ CONFIABILIDADE MÍNIMA DECLARADA 
    }

    // FUNÇÃO PARA OBTER O VALOR ATUAL DO DÓLAR
    async function getDolar(){
        var res = await fetch("https://dolarhoje.com/cotacao.txt");
        var dolar = await res.text();
        [real, centavo] = dolar.split(",");
        var txt = `O valor do dólar hoje é de ${real} reais e ${centavo} centavos`;
        newAnswer(txt);
    }

    // FUNÇÃO PARA OBTER A HORA
    function getHour(){
        var d = new Date();
        var h = d.getHours();
        var m = d.getMinutes();
        var s = d.getSeconds();
        var h_txt = h == 1 ? "hora" : "horas";
        var m_txt = m == 1 ? "minuto" : "minutos";
        var s_txt = s == 1 ? "segundo" : "segundos";
        newAnswer(`São ${String(h)} ${h_txt}, ${String(m)} ${m_txt} e ${String(s)} ${s_txt}`);
    }

    // FUNÇÃO PARA OBTER O NOME
    function getName(){
        newAnswer("Olá! Eu sou "+nome+". Prazer em te conhecer!!!");
    }

    // FUNÇÃO PARA OBTER DADOS RELATIVOS AO TEMPO NA MINHA LOCALIZAÇÃO COLHIDA NO INIT()
    async function getWeather(){
        var r = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${lon}&lang=pt_br&appid=${apiKey}`);
        var json = await r.json();
        var cidade = json.name;
        var temp = json.main.temp;
        var sensacao = json.main.feels_like;
        var min = json.main.temp_min;
        var max = json.main.temp_max;
        var humidade = json.main.humidity+"%";
        var ventos = (json.wind.speed* 3.6) == 1 ? (json.wind.speed* 3.6)+" quilômetro":(json.wind.speed* 3.6)+" quilômetros";
        var descricao = (json.weather[0].description);
        txt = `Faz ${temp} graus em ${cidade} com ${descricao} e ventos de até ${ventos}. Com máximas que podem chegar a ${max} graus e mínimas de ${min} graus. No momento, a sensação térmica é de ${sensacao} graus, com a humidade relativa do ar em ${humidade}.`;
        newAnswer(txt);
    }

    // FUNÇÃO PARA OBTER UM TEXTO E CONVERTER EM FALA
    function speak(){
        document.querySelector("#speaking").style.display = "none";
        var u = new SpeechSynthesisUtterance();
        u.text = answer;
        u.lang = 'pt-BR';
        u.rate = 1.2;
        u.pitch = 1.8;
        u.volume = 0.8;
        u.onend = function(event) { listen();}
        speechSynthesis.speak(u);
        document.querySelector(".btn_")
    }  

    // FUNÇÃO DE ALTERAR NOME DA ASSISTENTE
    function changeName(name){
        var n = name.split("para");
        nome = n[1].trim();
        newAnswer("nome alterado com sucesso!");
    }

    // FUNÇÃO DE ENVIO DE E-MAIL
    function sendEmail(text){
        acentos = {"ã":"a",
        "á":"a",
        "à":"a",
        "ó":"o",
        "ú":"u",
        "é":"e",
        "ê":"e",
        "í":"i",
        "ç":"c",
    }
        text = text.replace("enviar e-mail para",'');
        text = text.replace("e-mail",'');
        text = text.replace("e-mail para",'');
        text = text.replace(" ",'');
        text = text.replace(" ",'');
        text = text.replace(" ",'');
        text = text.replace(" ",'');
        text = text.replace(" ",'');
        for(letra of text){
            for(l in acentos){
                if(letra.indexOf(l) != -1){
                    text = text.replace(l,acentos[l]);
                }
            }
        }

        document.querySelector(".heardText").innerText = text;
        var win = window.open('mailto:'+text, '_blank');
    }

    // FUNÇÃO DE EXPRESSÃO MATEMÁTICA
    function expMath(exp){
        document.querySelector(".heardText").innerText = exp;
        var segment = exp.split(" ");

        // MULT
        while(segment.indexOf("x") != -1){
            for(s in segment){
            if(segment[s] == "x"){
                result = Number(segment[s-1]) * Number(segment[Number(s)+1]);
                segment.splice(s-1,3,result);
            }
        }
            console.log(segment);
        }


        // DIV
        while(segment.indexOf("/") != -1){
            for(s in segment){
            if(segment[s] == "/"){
                result = Number(segment[s-1]) / Number(segment[Number(s)+1]);
                segment.splice(s-1,3,result);
            }
        }
            console.log(segment);
        }


        // SOMA
        while(segment.indexOf("+") != -1){
            for(s in segment){
            if(segment[s] == "+"){
                result = Number(segment[s-1]) + Number(segment[Number(s)+1]);
                segment.splice(s-1,3,result);
            }
        }
            console.log(segment);
        }

        // SOMA
        while(segment.indexOf("-") != -1){
            for(s in segment){
            if(segment[s] == "-"){
                result = Number(segment[s-1]) - Number(segment[Number(s)+1]);
                segment.splice(s-1,3,result);
            }
        }
            console.log(segment);
        }
        exp = exp.replace("calcular","");
        newAnswer(`O resultado de ${exp} é ${segment[1]}`);


    }

    // FUNÇÃO PARA SOLICITAR LIGAÇÃO
    function callTo(text){
        text = text.split(" ");
        text = String(text[text.length -2] + text[text.length -1]);
        text = "+55"+text;
        var win = window.open('tel:'+ text, '_blank');
    }



// FUNÇÃO PARA OBTER O QUE O USUÁRIO FALA E CONVERTER EM TEXTO
function listen(){
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
    var recognition = new SpeechRecognition();
    recognition.rate = 2;
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.onstart = function (event) {
        document.querySelector("#hearing").style.display = "block";
    }
    recognition.onsoundstart = function (event) {
        document.querySelector("#hearing").style.display = "block";
    }
    recognition.onsoundend = function (event) {
        document.querySelector("#hearing").style.display = "none";
    }
    recognition.onresult = function(event) {
        // SEND TO IA
        let txt = event.results[0][0].transcript.toLowerCase(); 
        if(txt.indexOf("calcular") != -1 || txt.indexOf(" + ") != -1 ||  txt.indexOf(" - ") != -1 || txt.indexOf(" x ") != -1 || txt.indexOf(" / ") != -1){
            expMath(event.results[0][0].transcript);
        }else if(txt.search('enviar e-mail para') != -1 || txt.search('e-mail') != -1){
            sendEmail(txt);
        }else if(txt.search('ligar para') != -1 || txt.search('ligação para') != -1){
            callTo(txt);
        }else if(txt.search('mudar nome para') != -1 || txt.search('alterar nome para') != -1){
            changeName(txt);
        }else{
            whatToDo(event.results[0][0].transcript);
        }
        
    }

    recognition.audioend = function (event) {
        console.log("FIM")
    }

    recognition.speechend = function (event) {
        console.log("FIM 1")
    }

    recognition.start();
}


init(); // Iniciando a configuração
listen(); //Iniciando a solicitação de escutar o usuário
