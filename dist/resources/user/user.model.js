"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// OVO JE OBJEKAT KOJI PREDSTAVLAJ DEFINICIJU SCHEMA-E
const userSchemaDefinition = {
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    // OVO SU DODATNI SETTINGSI; ONDONO SASTOJE SE OD PODATAKA, KOJI SE NECE PROSLEDJIVATI, PRI KREIRANJU DOKUMENTA
    // AL ICE BITI KREIRANI SA SVOJIM DEFAULT-OVIMA
    settings: {
        // PO DEFAULTU TEMA CE BITI DARK
        theme: {
            type: String,
            required: true,
            default: 'dark'
        },
        // PO DEFAULTU, KORISNIKU CE SE SLATI NOTIFICATIONS (PODSETI SE KAKO SE ONE PODESAVAJU (PWA KUSRS))
        notifications: {
            type: Boolean,
            required: true,
            default: true
        },
        // PREDPOSTAVLJAM DA JE OVA OPCIJA VEZANA ZA RESPONSIVNES
        compactMode: {
            type: Boolean,
            required: true,
            default: true
        }
        // MOZDA AKO KORISNIK NEKADA PROMENI OVU OPCIJU, MOZDA CE MU BITI POSLAT DESKTOP SITE, A NE RESPONSIVE
    }
};
// USER SCHEMA, PRVI ARGUMENT JE PREDHODNI OBJEKAT
const userSchema = new mongoose_1.default.Schema(userSchemaDefinition, { timestamps: true });
// NAKON STO SAM DEFINISAO SCHEMA-U, NAJBOLJE JE DA VIZUALIZUJEM, KOJE BI TO HOOK-OVE MOGAO UPOTREBITI NA SCHEMA-I
/**
 * @HASHING PASSWORD-A
 *
 *  SE MOZE OBAVLJATI KROZ HOOK-OVE,
 *
 */
// MEDDJUTIM OVDE MORAM MALO UCI U 'PURE MONGODB LAND'
//       U HOOK-OVIMA, KOJE CU KORISTITI, JA CU MORATI KORISTITI DVE METODE NAD MONGODB DOKUMENTOM, KOJE SU DEO     MONGODB API   ,A   NE MONGOOSE-A
//            HOOK-OVI (MIDDLEWARE IZMEDJU MONGODB JAVASCRIPT API I MONGOOSE-A)
// STVARI SU POPRILICNO LOGICNE, POGOTOVO KADA IMAS TYPESCRIPT, KAO SVOJ TOOL, I KADA MOZES DA VIDIS SVE EVENTOVE
// ALI MORACU DA NAPRAVIM PAR DISTINGCIJA 
/** OVO SU DVA EVENT-A, OD MNOGIH
 * KOJA SE MOGU TRIGGEROVATI, I ZA KOJE JA MOGU DEFINISEM HOOK-OVE
 * @save  (U OVOM SLUCAJU OVAJ CU DEFINISTIVNO KORISTITI (OVO JE SAMO ZA CREATION DOKUMENT-A))
 * @update (OVAJ NECU KORISTI JER SE NECE TRIGGEROVATI ZA findOneAndUpdate ILI findByIdAndUpdate)
 */
// STVARI SU POPRILICNO JEDNOSTAVNE, JER SVAKA (NE BAS SVAKA) OD OVIH MONGOOSE-OVIH METODA IMA EKVIVALENTAN EVENT U HOOK-U
// EVO TI POSMATRAJ IZ UGLA KRIRANJA DOKUMENTA
//          save     EVENT  SE  JEDINO SE TRIGGER-UJE AKO SE, KREIRA NOVI DOKUMENT
// JA MOGU        pre       ILI       post      DAKLE PRE ILI POSLE, NA PRIMER KREIRANJA DOKUMENTA U DATBASE-U, DEFINISATI
// DA SE SE NESTO URADI, NESTO TRIGGERUJE, PA CAK MOGU I IZMENITI ONO STO SE TREBA POHRANITI, ILI ONO STO JE VEC POHRANJENO
// ALI IMAJ NA UMU DA TI SA save METODOM, IKLI update METODOM HANDLE-UJES JAVASCRIPT-OM MONGODB-JA, A NE MONGOOSE-A (STO NIJ NIKAKVA TRAGEDIJA)
// JEDINO FVODI RACUNA DA SE ONE     
// ALI TU NISTA NIJE TRAGICNO, JER pre i post HOOK-OVI IMAJU I          findOneAndUpdate      EVENT, KOJI SE TRIGGER-UJE ZA POZIVANJE
// findByIdAndUpdate()    ILI     findOneAndUpdate
// ****  I STA JA SAD MOGU RADITI U POGLEDU HASHING-A PASSWORD-A
/**
 * @A
 *
 * KADA SE INICIRA PRAVLJANJE NOVOG USER DOKUMENT-A, ZELI MDA SE IZVRSI HOOK PRE POHRANJIVANJA, HOOK KOJI CE UZETI PASSWORD, I OND
 * HASHOVATI GA I HASH STAVITI U DATABASE UMESTO PASSWORD-A U PLAIN TEKSTU
 *
 * @B
 *
 * ISTO TO ZELIM DA DEFINISEM HOOK, KOJI BI ISTO URADIO PRILIKOM UPDATING-A SIFRE (IAKO MI JE TO TRENUTNO NEBITNO)
 * OVO DRUGO BI SAMO RADIO, KAO PODSETNIK U POGLEDU KORISCENJA PRAVILNIH EVENT-OVA
 *
 *
 */
// **** JOS JEDNA BITNA STVAR       NE ZABORAVI DA POZEOVES next U HOOK-OVIMA, JER CE TI SERVER HANG-OVATI, JER JE REC O MIDDLEWARE-U,
// ****************                                                                                                 NE ZABORAVI TO
// DAKLE OVAJ HOOK CE SE IZVRSITI NEPOSREDNO PRE KREIRANJA DOKUMENTA U DATBASE-U, A OSTAVLJA MI SLOBODU DA
// MOGU DA MODIFIKUJEM NEKU VREDNOST, KOJE TREBA DA POSTANE VREDNOST FIELD-A, TOG NOVOG DOKUMENTA
// this     U OVOM HOOK-U REPREZENTUJE    Document      (A TO CE TI BITI I VIDLJIVO ZATO STO KORISTIS TYPESCRIPT)
userSchema.pre('save', function (next) {
    // PRVO SE PROVERAVA DA LI UOPSTE NOVI DOKUMENT IMA PASSWORD, I AKO NIJE, NIST SE NERADI, SAM OSE POZIVA next
    // DAKLE TADA SE FUNKCIAJ ZAUSTAVLJA, ODNOSNO PRELAZI SE NA SLEDECI MIDDLEWARE, AKO GA IMA
    if (!this.isModified('password'))
        return next();
    // AKO JE SIFRA STIGLA SA NOVIM DOKUMENTOM, TREBAM UZETI TU SIFRU, ZATIM JE TREBAM HASH-OVATI
    // I PONOVO ZAKACITI NA DOKUMENT KOJI CE BITI POHRANJEN
    const rounds = 8; // OVAJ BROJ, STO JE VECI, OMOGUCI CE DA HASH BUDE STO SIGURNIJI       https://flaviocopes.com/javascript-bcrypt/
    // ALI STO JE ON VECI, DUZE CE TRAJATI GENERISANJE HASH-A
    const password = this.password; // SIFRU UZIMAM SA DOKUMENT-A
    // SADA PRAVIM HASH)
    bcrypt_1.default.hash(password, rounds, (error, encrypted) => {
        if (error)
            return next(error)(this).password = encrypted;
        next();
    });
});
// ZAPAMTI DA NE SMS MULTIPLE TIMES DA HSH-UJES SIFRU, JER CE TAKO POSTATI NEUPOTREBLJIVA, NECES JE MOCI DECRYPT-OVATI
// OVAJ HOOK JE DAKLE OVDE SAMO KAO PODSETNIK DA AKO U KONTROLERU, PRILIKOM QUERY-JA I UPDATE-A ISKORISTIM JEDNU METODU
// DA OVDE MORA POSTOJATI, PRAVI EVENT, KOJI SE TRIGGER-UJE SAMO ZA TU METODU
// OVDE KORISTIM      EVENT       findOneAndUpdate          I IMAJ NA UMU DA SE ON TRIGGER-UJE SAMO ZA POZIVANJA        findOneAndUpdate()    ILI     findByIdAndUpdate
// this       U OVOM HOOK-U     REPREZENTUJE   mongoose.Query        (ALI I TO CE TI BITI ODMAH VIDLJIVO ZBOG TYPESCRIPT-A) 
userSchema.pre('findOneAndUpdate', function (next) {
    //     ONA SE SAMO POKRECE ZA SLUCAJ DA JE POKRENUT findOneAndUpdate() METODA NAD MODELOM
    const updated = this.getUpdate();
    if (!Object.keys(updated).includes('password'))
        return next();
    const password = updated.password;
    const rounds = 8;
    bcrypt_1.default.hash(password, rounds, (error, encrypted) => {
        if (error)
            return next(error);
        this.update({ password }, { password: encrypted });
        next();
    });
    // TESTIRAO SAM OVO NA DRUGOM PROJEKTU I ZAISTA KADA JE POKUSAN UPDATING, KORISCENJEM findOneAndUpdate METODE
    // TRIGGER-OVAN JE I OVAJ HOOK 
});
// SLEDECE STO DEFINISEM JESTE METODA, KOJA SE MOZE POZVATI NA QUERIED    mongoose.Document    -U
// ODNONO NA ONOM   Document -U, KOJI JE UZET IZ DATABASE
// IMAJ NA UMU DA CE TAKAV DOKUMENT IMATI NA SEBI         HASHED PASSWORD       JER SAMO TAKAV SE PASSWORD DAKLE SME I SAM OTAKAV CE BITI
//                                                                                              // POHRANJIVAN U DATBASE
// A CILJ METODE JE DA JOJ SE PROSLEDI NEKI STRING (ODNOSNO MOGUCI PASSWORD (OBICNI STRING))
// METODA TREBA DA UZME HASHED PASSWORD SA QUERIED Document-A
// A ONDA BI TREBALO DA SE IZVRSI, JESTE CHECKING-A IZMEDJU HASHED SIFRE I TOG MOGUCEG PASSWORDA (OBICNOG STRINGA)
// KORISCENJEM bcrypt-A
// DAKLE      this      U OVOJ METODI REPREZENTUJE          Document
/**
 * @DA NE ZABORAVIS, DA METODE ZA Documnt, MOZES ZADATI PREKO methods OBJEKTA
 */
// POSTO OVO NIJE MIDDLEWARE, NAJBOLJE JE DEFINISATI DA OVA METODA RETURNUJE PROMISE, JER CE TAKO BITI LAKSI RAD SA NJOM
// REJECTOVACE AKO HASHED I PROSLEDJENI PASWORD NE ODGOVARAJU, A RESOLVE-OVACE SE AKO ODGOVARAJU JEDNA DRUGOJ
userSchema.methods.checkPassword = function (password) {
    // DAKLE REKAO SAM DA SE HASHED PASSWORD, ZADAJE DOKUMENTU
    // SADA UZIMAM TAJ HASHED PASSWORD
    const encrypted = this.password;
    // PROVERI AGAINST PASSED IN PASSWORD, UZ POMOC bcrypt
    return new Promise((res, rej) => {
        bcrypt_1.default.compare(password, encrypted, (error, same) => {
            if (error)
                return rej(error);
            return res(same);
        });
    });
};
// !! KONACNO, NEMOJ DA TI PADNE NA PAMET DA HOOK-OVE ZADAJES NAKON STO SI KREIRAO MODEL
// NECE FUNKCIONISATI
exports.User = mongoose_1.default.model('user', userSchema);
