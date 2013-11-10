//////////////////////////////////////////////////////////////////////////
// Global Variables //
var pc=0;
var	memory;
var	registers;
var	instructions;
var tracetable;
var cycles=0;


//////////////////////////////////////////////////////////////////////////
// Binary Conversion //
function createMask () {
  var nMask = 0, nFlag = 0, nLen = arguments.length > 32 ? 32 : arguments.length;
  for (nFlag; nFlag < nLen; nMask |= arguments[nFlag] << nFlag++);
  return nMask;
}

function arrayFromMask (nMask) {
  // nMask must be between -2147483648 and 2147483647
  if (nMask > 0x7fffffff || nMask < -0x80000000) { throw new TypeError("arrayFromMask - out of range"); }
  for (var nShifted = nMask, aFromMask = []; nShifted; aFromMask.push(Boolean(nShifted & 1)), nShifted >>>= 1);
  var len=aFromMask.length;
  for(var i=len;i<32;i++)
  	aFromMask.push(false);
  return aFromMask;
}

function createBinaryString (nMask) {
  // nMask must be between -2147483648 and 2147483647
  for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32; nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
  return sMask;
}
 
function deleterow(tableID) {
  var table = document.getElementById(tableID);
  var rowCount = table.rows.length;

  table.deleteRow(rowCount-1);
} 
//////////////////////////////////////////////////////////////////////////
// DATA STRUCTURES //

function instructionMemory(){
	var instructions_set=new Array();
	var starting_address=0;

	instructionMemory.prototype.setStartingaddress = function (saddress) {
		starting_address=saddress;
	};

	instructionMemory.prototype.readInstruction = function (address) {
		return instructions_set[address-starting_address];
	};

	instructionMemory.prototype.addInstruction = function (instruction) {
		instructions_set.push(instruction);
	};

	instructionMemory.prototype.getSize = function () {
		return instructions_set.length;
	};

}

function registersMemory(){
	var registers_set = new Array();
	var write_addr="0";
	var write_signal=0;
	for(var i=0;i<32;i++)registers_set.push(0);

	registersMemory.prototype.getRegister = function (r1_addr) {
		var addr = parseInt(r1_addr, 2);
		return registers_set[addr];
	};

	registersMemory.prototype.setwriteData = function (write_data) {
		var addr = parseInt(write_addr, 2);
		if(addr!=0 && write_signal==1)
		registers_set[addr] = write_data;
	};

	registersMemory.prototype.setwriteAddr = function (waddr){
		write_addr=waddr;
	};

	registersMemory.prototype.setwriteControl = function (signal){
		write_signal=signal;
	};

	registersMemory.prototype.refresh = function (){
		write_addr="0";
		write_signal=0;
	};

	registersMemory.prototype.getSet = function () {
		return registers_set;
	};

	registersMemory.prototype.print =function (){
		var st="";
		for(var i=0;i<32;i++)
			st+=i+") \t__"+registers_set[i]+"__"+"\n";
		return st;
	};
}

function dataMemory(){
	var memory_set=new Array();
	for(var i=0;i<1024;i++)memory_set.push(0);
	var write_addr=0;
	var mem_write=0;
	var mem_read=0;
	var loadtype=0;
	var unsigned_flag=0;

	dataMemory.prototype.writeMemory = function (write_data) {
		if(mem_write==1){
			if(loadtype==0)
				this.writeWord(write_data);
			else if(loadtype==1)
				this.writeHalfword(write_data);
			else if(loadtype==2)
				this.writeByte(write_data);
		}
	};

	dataMemory.prototype.readMemory = function () {
		if(mem_read==1){
			if(loadtype==0)
				return this.readWord();
			else if(loadtype==1)
				return this.readHalfword();
			else if(loadtype==2)
				return this.readByte();
		}return 0;
	};

	dataMemory.prototype.writeWord = function (write_data) {
		if(mem_write==1)
			memory_set[write_addr]=write_data;
	};

	dataMemory.prototype.readWord = function () {
		if(mem_read==1)
			return memory_set[write_addr];
		return 0;
	};

	dataMemory.prototype.writeByte = function (write_data) {
		if(mem_write==1){
			var word_addr= Math.floor(write_addr/4);
			var the_word= memory_set[word_addr];
			var the_binary_word= createBinaryString(the_word);
			var relevant_place=write_addr-(4*word_addr);
			var binary_data=createBinaryByte(write_data);
			var word_parts=new Array();
			word_parts[0]=the_binary_word.substr(0,8);
			word_parts[1]=the_binary_word.substr(8,8);
			word_parts[2]=the_binary_word.substr(16,8);
			word_parts[3]=the_binary_word.substr(24,8);
			switch(relevant_place){
				case 0:
					word_parts[0]=binary_data;
					break;
				case 1:
					word_parts[1]=binary_data;
					break;
				case 2:
					word_parts[2]=binary_data;
					break;
				case 3:
					word_parts[3]=binary_data;
					break;
			}
			memory_set[word_addr]=parseInt(word_parts[0]+word_parts[1]+word_parts[2]+word_parts[3],2)
		}
	};

	dataMemory.prototype.readByte = function () {
		var output="0";
		if(mem_read==1){
			var word_addr= Math.floor(write_addr/4);
			var the_word= memory_set[word_addr];
			var the_binary_word= createBinaryString(the_word);
			var relevant_place=write_addr-(4*word_addr);
			switch(relevant_place){
				case 0:
					output= the_binary_word.substr(0,8);
					break;
				case 1:
					output= the_binary_word.substr(8,8);
					break;
				case 2:
					output= the_binary_word.substr(16,8);
					break;
				case 3:
					output= the_binary_word.substr(24,8);
					break;
				default:
					output= "0";
					break;
			}
			if(unsigned_flag==1)
				output=signExtendByte(output);
			return parseInt(output,2);
		}
		return 0;
	};

	dataMemory.prototype.writeHalfword = function (write_data) {
		if(mem_write==1){
			var binary_data=createBinaryString2(write_data);
			var partA=parseInt(binary_data.substr(0,8),2);
			var partB=parseInt(binary_data.substr(8,8),2);
			var old_addr= write_addr;
			var addr_1= write_addr * 2;
			var addr_2= addr_1 + 1;
			write_addr= addr_1;
			this.writeByte(partA);
			write_addr= addr_2;
			this.writeByte(partB);
			write_addr=old_addr;
		}
	};

	dataMemory.prototype.readHalfword = function () {
		if(mem_read==1){
			var old_addr= write_addr;
			var addr_1= write_addr * 2;
			var addr_2= addr_1 + 1;
			write_addr= addr_1;
			var partA=this.readByte();
			write_addr= addr_2;
			var partB=this.readByte();
			write_addr=old_addr;
			var binary_output=createBinaryByte(partA)+createBinaryByte(partB);
			if(unsigned_flag==1)
				binary_output=signExtend(binary_output);
			return parseInt(binary_output,2);
		}
	};


	dataMemory.prototype.setLoadType = function (signal){
		loadtype=signal;
	};

	dataMemory.prototype.setAddr = function (waddr){
		write_addr=waddr;
	};

	dataMemory.prototype.setMemwrite = function (signal){
		mem_write=signal;
	};

	dataMemory.prototype.setMemread = function (signal){
		mem_read=signal;
	};
	
	dataMemory.prototype.setSignExtend = function (signal){
		unsigned_flag=signal;
	};

	dataMemory.prototype.refresh = function (){
		addr=0;
		mem_write=0;
		unsigned_flag=0;
		mem_read=0;
		loadtype=0;
	};

	dataMemory.prototype.getSet = function (){
		return memory_set;
	};

	dataMemory.prototype.print =function (){
		var st="";
		for(var i=0;i<32;i++)
			st+=i+") \t__"+memory_set[i]+"__"+"\n";
		return st;
	};
}


//////////////////////////////////////////////////////////////////////////
// DataPath FUNCTIONS //

function andd(a,b){
	if(a==1&&b==1)
		return 1;
	return 0;
}

function mux(a,b,i){
	if(i==1)
		return b;
	return a;
}

function ALU(alu_Contol,value1,value2){
	var result=0;
	var data1 = value1;
	var data2 = value2;
 switch(alu_Contol){
	case 2:
		result=data1+data2;
		break;
	case 6:
		result=data1-data2;
		break;
	case 33:
		result=data1*data2;
		break;
	case 0:
		result=data1&data2;
		break;
	case 1:
		result=data1|data2;
		break;
	case 7:
		if(data1<data2)result=1;
		break;
	case 12:
		result=~(data1|data2)
		break;
	case 11:
		result=shiftleft(value1,value2);
		break;
	case 13:
		result=shiftright(value1,value2);
		break;
	default:
		result=0;
	}

	return result;
}

function ALU_signal(alu_Contol,value1,value2){
	var signal=0;
 switch(alu_Contol){
	case 19:
		if(value1==value2)
			signal=1;
		else 
			signal=0;
		break;
	case 20:
		if(value1!=value2)
			signal=1;
		else 
			signal=0;
		break;
	case 21:
		signal=2;
		break;
	default:
		signal=0;
		break;
	}
	return signal;
}

function signExtend(value){
	var nMyNumber = parseInt(value, 2);
	v=arrayFromMask(nMyNumber);
	if(v[15]){
		for(var i=16;i<32;i++)
			v[i]=true;
	}
	return createBinaryString(createMask.apply(this,v));
}

function signExtendByte(value){
	var nMyNumber = parseInt(value, 2);
	v=arrayFromMask(nMyNumber);
	if(v[7]){
		for(var i=8;i<32;i++)
			v[i]=true;
	}
	return createBinaryString(createMask.apply(this,v));
}

function shiftright(inp,val){
	return inp>>>val;
}

function shiftleft(inp,val){
	return inp<<val;
}

//////////////////////////////////////////////////////////////////////////
// Insturction Reading //

function Control(opcode){
	var RegDst=0;
	var	Branch=0;
	var	MemRead=0;
	var	MemtoReg=0;
	var	ALUop=0;
	var	MemWrite=0;
	var	ALUSrc=0;
	var	RegWrite=0;
	// Added Signals //
	var	Immediate=0;
	var LoadType=0;
	var Unsigned=0;
	var	Jump=0;
	var Jal=0;
	var LUI=0;
	if(opcode==0){
		//R-type
		RegDst=1;
		Branch=0;
		MemRead=0;
		MemtoReg=0;
		ALUop=2;
		MemWrite=0;
		ALUSrc=0;
		RegWrite=1;
		Immediate=0;
		LoadType=0;
		Unsigned=0;
		Jump=0;
		Jal=0;
		LUI=0;
	}else if(opcode==32){
		//I-type LB
		RegDst=0;
		Branch=0;
		MemRead=1;
		MemtoReg=1;
		ALUop=0;
		MemWrite=0;
		ALUSrc=1;
		RegWrite=1;
		Immediate=0;
		LoadType=2;
		Unsigned=0;
		Jump=0;
		Jal=0;
		LUI=0;
	}else if(opcode==33){
		//I-type LH
		RegDst=0;
		Branch=0;
		MemRead=1;
		MemtoReg=1;
		ALUop=0;
		MemWrite=0;
		ALUSrc=1;
		RegWrite=1;
		Immediate=0;
		LoadType=1;
		Unsigned=0;
		Jump=0;
		Jal=0;
		LUI=0;
	}else if(opcode==35){
		//I-type LW
		RegDst=0;
		Branch=0;
		MemRead=1;
		MemtoReg=1;
		ALUop=0;
		MemWrite=0;
		ALUSrc=1;
		RegWrite=1;
		Immediate=0;
		LoadType=0;
		Unsigned=0;
		Jump=0;
		Jal=0;
		LUI=0;				
	}else if(opcode==36){
		//I-type LBU
		RegDst=0;
		Branch=0;
		MemRead=1;
		MemtoReg=1;
		ALUop=0;
		MemWrite=0;
		ALUSrc=1;
		RegWrite=1;
		Immediate=0;
		LoadType=2;
		Unsigned=1;
		Jump=0;
		Jal=0;			
		LUI=0;	
	}else if(opcode==37){
		//I-type LHU
		RegDst=0;
		Branch=0;
		MemRead=1;
		MemtoReg=1;
		ALUop=0;
		MemWrite=0;
		ALUSrc=1;
		RegWrite=1;
		Immediate=0;
		LoadType=1;
		Unsigned=1;
		Jump=0;
		Jal=0;			
		LUI=0;	
	}else if(opcode==43){
		//I-type SW
		RegDst=0;
		Branch=0;
		MemRead=0;
		MemtoReg=0;
		ALUop=0;
		MemWrite=1;
		ALUSrc=1;
		RegWrite=0;
		Immediate=0;
		LoadType=0;
		Unsigned=0;
		Jump=0;
		Jal=0;	
		LUI=0;			
	}else if(opcode==41){
		//I-type SH
		RegDst=0;
		Branch=0;
		MemRead=0;
		MemtoReg=0;
		ALUop=0;
		MemWrite=1;
		ALUSrc=1;
		RegWrite=0;
		Immediate=0;
		LoadType=1;
		Unsigned=0;
		Jump=0;
		Jal=0;
		LUI=0;				
	}else if(opcode==40){
		//I-type SB
		RegDst=0;
		Branch=0;
		MemRead=0;
		MemtoReg=0;
		ALUop=0;
		MemWrite=1;
		ALUSrc=1;
		RegWrite=0;
		Immediate=0;
		LoadType=2;
		Unsigned=0;
		Jump=0;
		Jal=0;
		LUI=0;				
	}else if(opcode==4){
		//BEQ
		RegDst=0;
		Branch=1;
		MemRead=0;
		MemtoReg=0;
		ALUop=19;
		MemWrite=0;
		ALUSrc=0;
		RegWrite=0;
		Immediate=0;
		LoadType=0;
		Unsigned=0;
		Jump=0;
		Jal=0;
		LUI=0;				
	}else if(opcode==8){
		//Addi
		RegDst=0;
		Branch=0;
		MemRead=0;
		MemtoReg=0;
		ALUop=3;
		MemWrite=0;
		ALUSrc=0;
		RegWrite=1;
		Immediate=1;
		LoadType=0;
		Unsigned=0;
		Jump=0;
		Jal=0;	
		LUI=0;	
	}else if(opcode==12){
		//Andi
		RegDst=0;
		Branch=0;
		MemRead=0;
		MemtoReg=0;
		ALUop=4;
		MemWrite=0;
		ALUSrc=0;
		RegWrite=1;
		Immediate=1;
		LoadType=0;
		Unsigned=0;
		Jump=0;		
		Jal=0;
		LUI=0;
	}else if(opcode==13){
		//Ori
		RegDst=0;
		Branch=0;
		MemRead=0;
		MemtoReg=0;
		ALUop=5;
		MemWrite=0;
		ALUSrc=0;
		RegWrite=1;
		Immediate=1;
		LoadType=0;
		Unsigned=0;
		Jump=0;		
		Jal=0;
		LUI=0;
	}else if(opcode==5){
		//BNE
		RegDst=0;
		Branch=1;
		MemRead=0;
		MemtoReg=0;
		ALUop=20;
		MemWrite=0;
		ALUSrc=0;
		RegWrite=0;
		Immediate=0;
		LoadType=0;
		Unsigned=0;
		Jump=0;
		Jal=0;
		LUI=0;
	}else if(opcode==2){
		//J
		RegDst=0;
		Branch=0;
		MemRead=0;
		MemtoReg=0;
		ALUop=0;
		MemWrite=0;
		ALUSrc=0;
		RegWrite=0;
		Immediate=0;
		LoadType=0;
		Unsigned=0;
		Jump=1;
		Jal=0;
		LUI=0;
	}else if(opcode==3){
		//JAL
		RegDst=0;
		Branch=0;
		MemRead=0;
		MemtoReg=0;
		ALUop=0;
		MemWrite=0;
		ALUSrc=0;
		RegWrite=0;
		Immediate=0;
		LoadType=0;
		Unsigned=0;
		Jump=1;
		Jal=1;
		LUI=0;
	}else if(opcode==15){
		//LUI
		RegDst=0;
		Branch=0;
		MemRead=0;
		MemtoReg=0;
		ALUop=0;
		MemWrite=0;
		ALUSrc=0;
		RegWrite=0;
		Immediate=0;
		LoadType=0;
		Unsigned=0;
		Jump=0;
		Jal=0;
		LUI=1;
	}
	flags=[RegDst,Branch,MemRead,MemtoReg,ALUop,MemWrite,ALUSrc,RegWrite,Immediate,LoadType,Unsigned,Jump,Jal,LUI];
	return [RegDst,Branch,MemRead,MemtoReg,ALUop,MemWrite,ALUSrc,RegWrite,Immediate,LoadType,Unsigned,Jump,Jal,LUI];
}

function ALUControl(ALUop,functionop){
 var ALUControl=0;
		if(ALUop==0)
			ALUControl=2;
		else if(ALUop==1)
			ALUControl=6;
		else if(ALUop==2){
			switch(functionop){
				case 32:
					//Add
					ALUControl=2;
					break;
				case 34:
					//Subtract
					ALUControl=6;
					break;
				case 36:
					//And
					ALUControl=0;
					break;
				case 37:
					//Or
					ALUControl=1;
					break;
				case 42:
					//Set if lessthan
					ALUControl=7;
					break;
				case 0:
					//Shift Left
					ALUControl=11;
					break;
				case 2:
					//Shift Right
					ALUControl=13;
					break;
				case 39:
					//Nor
					ALUControl=12;
					break;
				case 8:
					//Jr
					ALUControl=21;
					break;					
				default:
					ALUControl=0;
				}
		}else if(ALUop==3){
			// Addi
			ALUControl=2;
		}else if(ALUop==4){
			// Andi
			ALUControl=0;
		}else if(ALUop==5){
			// Ori
			ALUControl=1;
		}else if(ALUop==19){
			ALUControl=19;
		}else if(ALUop==20){
			ALUControl=20;
		}
		return ALUControl;
}


function shiftContol(functionop){
	var Shift=0;
	if(functionop==13||functionop==11)
		Shift = 1;
	return Shift;
}
//////////////////////////////////////////////////////////////////////////

function simulate(instruction){
	var opcode=instruction.substr(0,6);
	var rs=instruction.substr(6,5);
	var rt=instruction.substr(11,5);
	var rd=instruction.substr(16,5);
	var shamt=instruction.substr(21,5);
	var funct=instruction.substr(26,6);
	var address=instruction.substr(16,16);
	var jumpaddress=instruction.substr(7,26);
	////////////////////////////////////
	var control_output =Control(parseInt(opcode, 2));
	////////////////////////////////////
	var RegDst=control_output[0];
	var	Branch=control_output[1];
	var	MemRead=control_output[2];
	var	MemtoReg=control_output[3];
	var	ALUop=control_output[4];
	var	MemWrite=control_output[5];
	var	ALUSrc=control_output[6];
	var	RegWrite=control_output[7];
	var Immediate=control_output[8];
	var LoadType=control_output[9];
	var Unsigned=control_output[10];
	var Jump=control_output[11];	
	var Jal=control_output[12];	
	var LUI=control_output[13];
	var alu_control_signal= ALUControl(ALUop,parseInt(funct, 2));
	var Shift=shiftContol(alu_control_signal);
	////////////////////////////////////
	var writing_addr=mux(rt,rd,RegDst);
	registers.setwriteAddr(writing_addr);
	registers.setwriteControl(RegWrite);
	var ReadData1= registers.getRegister(rs);
	var ReadData2= registers.getRegister(rt);
	// Write data remain
	////////////////////////////////////
	var extended= signExtend(address);
	var alu_input2_tmp1= mux(ReadData2,parseInt(extended, 2),ALUSrc);
	var alu_input2_tmp2=mux(alu_input2_tmp1,parseInt(shamt, 2),Shift);
	var alu_input2=mux(alu_input2_tmp2,parseInt(address, 2),Immediate);
	var alu_result= ALU(alu_control_signal,ReadData1,alu_input2);
	var alu_signal= ALU_signal(alu_control_signal,ReadData1,alu_input2);
	////////////////////////////////////
	memory.setSignExtend(Unsigned);
	memory.setLoadType(LoadType);
	memory.setAddr(alu_result);
	memory.setMemwrite(MemWrite);
	memory.writeMemory(ReadData2);
	memory.setMemread(MemRead);
	var memory_read_data = memory.readMemory();
	var write_data = mux(alu_result,memory_read_data,MemtoReg);
	////////////////////////////////////
	registers.setwriteData(write_data);
	////////////////////////////////////
	if(LUI==1){
		registers.refresh();
		registers.setwriteControl(1);
		registers.setwriteAddr(rt);
		var shifted=parseInt(address,2)*Math.pow(2,16);
		registers.setwriteData(shifted);
		registers.refresh();
	}
	////////////////////////////////////

	tracetable += "<tr>";
	tracetable += "<td>" + pc*4 + "</td>";
	tracetable += "<td>" + cycles + "</td>";
	tracetable += "<td>" + control_output[0] + "</td>";
	tracetable += "<td>" + control_output[1] + "</td>";
	tracetable += "<td>" + control_output[3] + "</td>";
	tracetable += "<td>" + control_output[4] + "</td>";
	tracetable += "<td>" + control_output[5] + "</td>";
	tracetable += "<td>" + control_output[6] + "</td>";
	tracetable += "<td>" + control_output[7] + "</td>";
	tracetable += "<td>" + control_output[8] + "</td>";
	tracetable += "<td>" + control_output[9] + "</td>";
	tracetable += "<td>" + control_output[10] + "</td>";
	tracetable += "<td>" + control_output[11] + "</td>";
	tracetable += "<td>" + Shift + "</td>";
	tracetable += "</tr>";
	////////////////////////////////////
	if(Jal==1){
		registers.refresh();
		registers.setwriteControl(1);
		registers.setwriteAddr("11111");
		registers.setwriteData(pc+1);
	}
	////////////////////////////////////
	add_input2 = pc+1;
	var Branch_condition = andd(Branch,alu_signal);
	var pc_tmp = mux(add_input2,parseInt(address,2),Branch_condition);
	var pc_tm2=mux(pc_tmp,ReadData1,Math.floor(alu_signal/2));
	pc=mux(pc_tm2,parseInt(jumpaddress,2),Jump);
	registers.refresh();
	memory.refresh();
}


//////////////////////////////////////////////////////////////////////////
// Simulation //
function intialize(){
	pc=0;
	cycles=0;
	instructions= new instructionMemory();
	registers= new registersMemory();
	memory= new dataMemory();
  tracetable = "";
  tracetable = "<table id='trace' class = tableBorder>";
  tracetable += "<tr class = steps>";
  tracetable += "<td>" + "TraceTable" + "</td>";
  tracetable += "</tr>";
  tracetable += "<tr class = steps>";
  tracetable += "<td>" + "PC" + "</td>";
  tracetable += "<td>" + "Cycle" + "</td>";
  tracetable += "<td>" + "RegDst" + "</td>";
  tracetable += "<td>" + "Branch" + "</td>";
  tracetable += "<td>" + "MemRead" + "</td>";
  tracetable += "<td>" + "MemtoReg" + "</td>";
  tracetable += "<td>" + "MemWrite" + "</td>";
  tracetable += "<td>" + "ALUSrc" + "</td>";
  tracetable += "<td>" + "RegWrite" + "</td>";
  tracetable += "<td>" + "Immediate" + "</td>";
  tracetable += "<td>" + "LoadType" + "</td>";
  tracetable += "<td>" + "Jump" + "</td>";
  tracetable += "<td>" + "Unsigned" + "</td>";
  tracetable += "<td>" + "Shift" + "</td>";
  tracetable += "</tr>";
}

function run(){
	var fetchedInstruction=0;
	while(pc!=undefined){
		if(instructions.readInstruction(pc)!=undefined){
			cycles++;
			fetchedInstruction = instructions.readInstruction(pc).toString();
			simulate(fetchedInstruction);
	}else
		break;
	}
	tracetable += "</table>";
  document.getElementById("traceTable").innerHTML = tracetable;
  //deleterow("trace");
	drawArrayRegister(registers.getSet());
	drawArrayMemory(memory.getSet());
}

//////////////////////////////////////////////////////////////////////////