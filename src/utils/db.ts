import mongoose from 'mongoose'

// SECRET STVARI

const DATABASE_NAME = process.env.DATABASE_NAME


// FUNKCIJA ZA CONNECTING NA DATBASE

export const connect = async () => {

  return await mongoose.connect(
    `mongodb://localhost:27017/${DATABASE_NAME}`,
    { useUnifiedTopology: true, useNewUrlParser: true }
  )

}



