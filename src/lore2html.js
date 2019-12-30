( function () {

  function lexxer( callback ) {
    this.callback = callback;
  }

  lexxer.prototype._S_BEGIN  = 0;
  lexxer.prototype._S_NOTNEW = 1;
  lexxer.prototype._S_NEW    = 2;

  lexxer.prototype.init = function ( callback ) {
    if( "function" === typeof callback ) { this.callback = callback; }
    this.state = lexxer.prototype._S_BEGIN;
    this.buffer_max = 32;
    this.buffer = Buffer.alloc( this.buffer_max );
    this.index = 0;
    this.line = 0;
    this.column = 0;
  };
  
  lexxer.prototype.write = function( buf ) {
    for( const value of buf.values() ) {
      const isNewline = ( 10 == value );

      switch( this.state ) {
      case lexxer.prototype._S_BEGIN:
        if( isNewline ) {
          // consume the newline character, stay in BEGIN state
        } else {
          this.appendToBuffer( value );
          this.column++;
          this.state = lexxer.prototype._S_NOTNEW;
        }
        break;
        
      case lexxer.prototype._S_NOTNEW:
        this.appendToBuffer( value );
        
        if( isNewline ) {
          this.state = lexxer.prototype._S_NEW;
        } else {
          this.column++;
        }
        break;
        
      case lexxer.prototype._S_NEW:
        if( isNewline ) {
          this.callback.apply( this, [ null, 'block', this.buffer.subarray( 0, this.index ) ] );
          this.index = 0;
          this.state = lexxer.prototype._S_BEGIN;
        } else {
          this.appendToBuffer( value );
          this.column++;
          this.state = lexxer.prototype._S_NOTNEW;
        }
        break;
      }

      if( isNewline ) {
        this.column = 0;
        this.line++;
      }
    }
  };

  lexxer.prototype.appendToBuffer = function( value ) {
    this.buffer.writeUInt8( value, this.index++ );
    this.index++;
    if( this.index >= this.buffer_max ) {
      this.callback.apply( this, [ null, 'full', this.buffer.subarray( 0, this.index ) ] );
      this.index = 0;
    }
  };
  
  lexxer.prototype.close = function() {
    if( this.index > 0 ) {
      this.callback.apply( this, [ null, 'block', this.buffer.subarray( 0, this.index ) ] );
      this.index = 0;
    }
  };
  
  exports.lexxer = lexxer;

} ) ();
