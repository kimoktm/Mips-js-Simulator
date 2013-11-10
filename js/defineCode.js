var startingAddress = 0;
var startAt=0;
var labels={};

function splitCode(){
	var lines = $('.code').val().split('\n');
  var line = lines[0].split(" ");
  if (line[0] == "origin")
  {
    startAt=1;
    startingAddress=line[1];
  }else{
    startAt=0;
    startingAddress=0;
  }
  intialize();
  addLables(lines);
  for(var i = startAt;i < lines.length;i++){
    line = lines[i].split(" ");
    if(line[1] == ":")
    {
      splitCodeHelper(2, line);
    }
    else
    {
      splitCodeHelper(0,line);  
    }
      console.log(line[i]+" , "+i);
  }
  run();
  document.getElementById("svg_118").textContent = pc*4;
}

function addLables(allCode){
  var line;
  for(var i = startAt;i < allCode.length;i++){
    line = allCode[i].split(" ");
    if(line[1] == ":"){
      if(startingAddress>0)
        labels[line[0]]=i+startingAddress-1;
      else
        labels[line[0]]=i;
      console.log(line[0]+" , "+labels[line[0]]);
    }
  }
}		

function createBinaryByte (nMask) {
  // nMask must be between -2147483648 and 2147483647
  for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32; nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
  return sMask.substr(24,31);
}


function createBinary5 (nMask) {
  // nMask must be between -2147483648 and 2147483647
  for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32; nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
  return sMask.substr(27,31);
}

function createBinaryString2 (nMask) {
  // nMask must be between -2147483648 and 2147483647
  for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32; nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
  return sMask.substr(16,31);
}

function createBinaryString3 (nMask) {
  // nMask must be between -2147483648 and 2147483647
  for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32; nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
  return sMask.substr(6,31);
}

function splitCodeHelper(index, line){	
  var format;
  var op;
  var rs;
  var rt;
  var rd;
  var shamt;
  var funct;
  var address;
  if(line[index] == "add")
  {
    op = "000000";
    rs=translateRegister(line[index+2]);
    rt=translateRegister(line[index+3]);
    rd=translateRegister(line[index+1]);
    shamt = "00000";
    funct = "100000";
    format = op+rs+rt+rd+shamt+funct;
    
  }
  else if (line[index]=="addi")
  {
    op = "001000";
    rs=translateRegister(line[index+2]);
    rt=translateRegister(line[index+1]);;
    address=createBinaryString2(line[index+3]);
    format = op+rs+rt+address;
  }
  else if (line[index]=="sub")
  {
    op = "000000";
    rs=translateRegister(line[index+2]);
    rt=translateRegister(line[index+3]);
    rd=translateRegister(line[index+1]);
    shamt = "00000";
    funct = "100010";
    format = op+rs+rt+rd+shamt+funct;
  }
  else if (line[index]=="lw")
  {
    op = "100011";
    rs=translateRegister(line[index+3]);
    rt=translateRegister(line[index+1]);;
    address=createBinaryString2(line[index+2]/4);
    format = op+rs+rt+address;
  }
  else if (line[index]=="lh")
  {
    op = "100001";
    rs=translateRegister(line[index+3]);
    rt=translateRegister(line[index+1]);;
    address=createBinaryString2(line[index+2]/2);
    format = op+rs+rt+address;
  }
  else if (line[index]=="lhu")
  {
    op = "100101";
    rs=translateRegister(line[index+3]);
    rt=translateRegister(line[index+1]);;
    address=createBinaryString2(line[index+2]/2);
    format = op+rs+rt+address;
  }
  else if (line[index]=="lb")
  {
    op = "100000";
    rs=translateRegister(line[index+3]);
    rt=translateRegister(line[index+1]);;
    address=createBinaryString2(line[index+2]);
    format = op+rs+rt+address;
  }
  else if (line[index]=="lbu")
  {
    op = "100100";
    rs=translateRegister(line[index+3]);
    rt=translateRegister(line[index+1]);;
    address=createBinaryString2(line[index+2]);
    format = op+rs+rt+address;
  }
  else if (line[index]=="sw")
  {
    op = "101011";
    rs=translateRegister(line[index+3]);
    rt=translateRegister(line[index+1]);;
    address=createBinaryString2(line[index+2]/4);
    format = op+rs+rt+address;
  }
  else if (line[index]=="sh")
  {
    op = "101001";
    rs=translateRegister(line[index+3]);
    rt=translateRegister(line[index+1]);;
    address=createBinaryString2(line[index+2]);
    format = op+rs+rt+address;
  }
  else if (line[index]=="sb")
  {
    op = "101000";
    rs=translateRegister(line[index+3]);
    rt=translateRegister(line[index+1]);;
    address=createBinaryString2(line[index+2]);
    format = op+rs+rt+address;
  }
  else if (line[index]=="lui")
  {
    op = "001111";
    rs="00000";
    rt=translateRegister(line[index+1]);
    address=createBinaryString2(line[index+2]);
    format = op+rs+rt+address;
  }
  else if (line[index]=="sll")
  {
    op = "000000";
    rs=translateRegister(line[index+2]);
    rt="00000";
    rd=translateRegister(line[index+1]);
    shamt = createBinary5(line[index+3]);
    funct = "000000";
    format = op+rs+rt+rd+shamt+funct;
  }
  else if (line[index]=="srl")
  {
    op = "000000";
    rs=translateRegister(line[index+2]);
    rt="00000";
    rd=translateRegister(line[index+1]);
    shamt = createBinary5(line[index+3]);
    funct = "000010";
    format = op+rs+rt+rd+shamt+funct;
  }
  else if (line[index]=="and")
  {
    op = "000000";
    rs=translateRegister(line[index+2]);
    rt=translateRegister(line[index+3]);
    rd=translateRegister(line[index+1]);
    shamt = "00000";
    funct = "100100";
    format = op+rs+rt+rd+shamt+funct;
  }
  else if (line[index]=="andi")
  {
    op = "001100";
    rs=translateRegister(line[index+2]);
    rt=translateRegister(line[index+1]);;
    address=createBinaryString2(line[index+3]);
    format = op+rs+rt+address;
  }
  else if (line[index]=="or")
  {
    op = "000000";
    rs=translateRegister(line[index+2]);
    rt=translateRegister(line[index+3]);
    rd=translateRegister(line[index+1]);
    shamt = "00000";
    funct = "100101";
    format = op+rs+rt+rd+shamt+funct;
  }
  else if (line[index]=="ori")
  {
    op = "001101";
    rs=translateRegister(line[index+2]);
    rt=translateRegister(line[index+1]);;
    address=createBinaryString2(line[index+3]);
    format = op+rs+rt+address;
  }
  else if (line[index]=="nor")
  {
    op = "000000";
    rs=translateRegister(line[index+2]);
    rt=translateRegister(line[index+3]);
    rd=translateRegister(line[index+1]);
    shamt = "00000";
    funct = "100111";
    format = op+rs+rt+rd+shamt+funct;
  }
  else if (line[index]=="beq")
  {
    op = "000100";
    rs=translateRegister(line[index+1]);
    rt=translateRegister(line[index+2]);;
    address=createBinaryString2(labels[line[index+3]]);
    format = op+rs+rt+address;
  }
  else if (line[index]=="bne")
  {
    op = "000101";
    rs=translateRegister(line[index+1]);
    rt=translateRegister(line[index+2]);;
    address=createBinaryString2(labels[line[index+3]]);
    format = op+rs+rt+address;
  }
  else if (line[index]=="j")
  {
    op = "000010";
    address=createBinaryString3(labels[line[index+1]]);
    format = op+address;   
 	}
  else if (line[index]=="jal")
  {
    op = "000011";
    address=createBinaryString3(labels[line[index+1]]);
    format = op+address;  
  }
  else if (line[index]=="jr")
  {
    op = "000000";
    rs=translateRegister(line[index+1]);
    rt="00000";
    rd="00000";
    shamt = "00000";
    funct = "001000";
    format = op+rs+rt+rd+shamt+funct;
  }
  else if (line[index]=="slt")
  {
    op = "000000";
    rs=translateRegister(line[index+2]);
    rt=translateRegister(line[index+3]);
    rd=translateRegister(line[index+1]);
    shamt = "00000";
    funct = "101010";
    format = op+rs+rt+rd+shamt+funct;
  }
  else
  {
  	alert("Unknown syntax detected " + line[index]);
  }
  instructions.addInstruction(format);
}


function translateRegister(register)
{
  var reg = "";
  if (register == "$zero") 
  {
    reg = "00000";
  }
  else if (register=="$at")
  {
    reg = "00001";
  }
  else if (register=="$v0")
  {
    reg = "00010";
  }
  else if (register=="$v1")
  {
    reg = "00011";
  }
  else if (register=="$a0")
  {
    reg = "00100";
  }
  else if (register=="$a1")
  {
    reg = "00101";
  }
  else if (register=="$a2")
  {
    reg = "00110";
  }
  else if (register=="$a3")
  {
    reg = "00111";
  }
  else if (register=="$t0")
  {
    reg = "01000";
  }
  else if (register=="$t1")
  {
    reg = "01001";
  }
  else if (register=="$t2")
  {
    reg = "01010";
  }
  else if (register=="$t3")
  {
    reg = "01011";
  }
  else if (register=="$t4")
  {
    reg = "01100";
  }
  else if (register=="$t5")
  {
    reg = "01101";
  }
  else if (register=="$t6")
  {
    reg = "01110";
  }
  else if (register=="$t7")
  {
    reg = "01111";
  }
  else if (register=="$s0")
  {
    reg = "10000";
  }
  else if (register=="$s1")
  {
    reg = "10001";
  }
  else if (register=="$s2")
  {
    reg = "10010";
  }
  else if (register=="$s3")
  {
    reg = "10011";
  }
  else if (register=="$s4")
  {
    reg = "10100";
  }
  else if (register=="$s5")
  {
    reg = "10101";
  }
  else if (register=="$s6")
  {
    reg = "10110";
  }
  else if (register=="$s7")
  {
    reg = "10111";
  }
  else if (register=="$t8")
  {
    reg = "11000";
  }
  else if (register=="$t9")
  {
    reg = "11001";
  }
  else if (register=="$k0")
  {
    reg = "11010";
  }
  else if (register=="$k1")
  {
    reg = "11011";
  }
  else if (register=="$gp")
  {
    reg = "11100";
  }
  else if (register=="$sp")
  {
    reg = "11101";
  }
  else if (register=="$fp")
  {
    reg = "11110";
  }
  else if (register=="$ra")
  {
    reg = "11111";
  }
  return reg;
}