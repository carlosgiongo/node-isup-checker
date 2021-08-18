const fs = require('fs')
const got = require('got');
const nodemailer = require("nodemailer");

const removeItem = (arr, item) => {
    let newArray = [...arr];
    const index = newArray.findIndex((item) => item === "🦄");
    if (index !== -1) {
        newArray.splice(index, 1);
        return newArray;
    }
};

var sites_flags = [];
setInterval(main,300000);

async function main(){
    var flag_date = new Date();
    var current_hour = flag_date.getHours();

    if(current_hour == 6 || current_hour == 12 || current_hour == 18 || current_hour == 0){
        console.log("Em horário de reset de flags!")
        sites_flags = [];
    }

    try {
        const data = fs.readFileSync('links.txt', 'utf8')
        var lines = data.split('\n')
        lines.forEach(async(element) => {
            got(element).then(response => {
                console.log("SITE " + element + ": " + response.statusCode)
            }).catch(err => {
                console.log("ERRO -> " + element + ". Codigo: " + err); 
                console.log("Tentando novaemente.. Aguarde")
                setTimeout(() => {
                    got(element).then(responsealt => {
                        console.log("SITE " + element + ": " + responsealt.statusCode)
                        if(sites_flags.includes(element)){
                            sites_flags = removeItem(sites_flags, element)
                        }
                    }).catch(erralt => {
                        console.log("ERRO -> " + element + ". Codigo: " + erralt)
                        if(!sites_flags.includes(element)){
                            let date_ob = new Date();
                            let date = ("0" + date_ob.getDate()).slice(-2);
                            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                            let year = date_ob.getFullYear();
                            let hours = date_ob.getHours();
                            let minutes = date_ob.getMinutes();
                            let seconds = date_ob.getSeconds();
    
                            var data_completa = "[" + date + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds + "]"
                            EnviarEmail(element, err, data_completa);
                            sites_flags.push(element)
                        } else {
                            console.log("SITE JÁ NA FLAG!")
                        }
                    }, 5000)
                })
            });        
        })
        console.log("##------------------------------------------------------------------##")
    } 
    
    /** OUT ESCOPE */
    catch (err) {
        console.log("ERRO DE ESCOPO!")
    }
}

function EnviarEmail(site, erro, data){
    nodemailer.createTestAccount((err, account) => {
        if (err) {
            console.error('Falha ao instanciar a conta de teste');
            console.error(err);
            return process.exit(1);
        }
    
        console.log('Coletando credenciais e enviando mensagem..');
    
        // NB! Store the account object values somewhere if you want
        // to re-use the same account for future mail deliveries
    
        // Create a SMTP transporter object
        let transporter = nodemailer.createTransport(
            {
                host: "x",
                port: 587,
                secure: false,
                auth: {
                    user: "y",
                    pass: "z"
                }
            },
            {    
                // sender info
                from: 'Checker <no-reply@vandoir.com.br>'
            }
        );
    
        // Message object
        let message = {
            // Comma separated list of recipients
            to: 'Web2 <web2@voxbrazil.com.br>',
    
            // Subject of the message
            subject: 'Checker - Site fora! -> ' + site + " " + data,
    
            // HTML body
            html: `<p><b>${site}</b> está fora do ar</p>
            <p>Segue codigo de erro:<br/> ${erro} </p>`,
        };
    
        transporter.sendMail(message, (error, info) => {
            if (error) {
                console.log('Error occurred');
                console.log(error.message);
                return process.exit(1);
            }
    
            console.log('Email enviado com sucesso!');
    
            // only needed when using pooled connections
            transporter.close();
        });
    });
}