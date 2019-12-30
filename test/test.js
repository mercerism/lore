const lore2html = require( '../src/lore2html.js' );

var section = "";

function callback ( err, why, buf ) {
  if( 'full' == why ) {
    section += buf.toString();
  } else if ( 'block' == why ) {
    section += buf.toString();
    console.log( "Block: " + section );
    section = "";
  }
}

let lexxer = new lore2html.lexxer( callback );

lexxer.init();
lexxer.write( Buffer.from( "::section\nNew Section\n\nI am a new block.1234567890ABCDEF\n" ) );
lexxer.close();
