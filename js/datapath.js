function drawTable()
{
  var lines = $('.code').val().split('\n');
  var line="";
  var tablecontents = "";
    tablecontents = "<table class =codeTable>";
    tablecontents += "<tr class = steps>";
    tablecontents += "<td>" + "Steps" + "</td>";
    tablecontents += "</tr>";

    for (var i = 0; i < lines.length; i ++)
   {
      line = lines[i].split(" ");
      if(line[1] == ":")
    {
      var format=parseInt(getFormat(0,line),2);
      tablecontents += "<tr class = "+line[2]+" onclick ="+line[2]+"();"+'changeContent('+format+');'+">";
    }
    else
    {      
      var format=parseInt(getFormat(0,line),2);
      tablecontents += "<tr class = "+line[0]+" onclick ="+line[0]+"();"+'changeContent('+format+');'+">";
    }
      for (var y = 0; y < line.length; y ++)
      {
      tablecontents += "<td>" + line[y] + "</td>";
     }
     tablecontents += "</tr>";
   }
    tablecontents += "<tr class = defaultw onclick= defaultw()>";
    tablecontents += "<td>" + "Default View" + "</td>";
    tablecontents += "</tr>";
   tablecontents += "</table>";
   document.getElementById("tablespace").innerHTML = tablecontents;
}

var registerNames =["$zero", "$at", "$v0","$v1", "$a0","$a1", "$a2", "$a3", "$t0","$t1","$t2","$t3","$t4","$t5","$t6","$t7","$s0","$s1","$s2","$s3","$s4","$s5","$s6","$s7", "$t8","$t9", "$k0","$k1", "$gp", "$sp", "$fp","$ra"]
function drawArrayRegister(registers)
{
  var tablecontents = "";
    tablecontents = "<table class = tableBorder>";
    tablecontents += "<tr class = steps>";
    tablecontents += "<td>" + "Registers" + "</td>";
    tablecontents += "</tr>";

    for (var i = 0; i < registers.length; i ++)
   {
     
      tablecontents += "<tr>";
      tablecontents += "<td>" + registerNames[i] + "</td>";
      tablecontents += "<td>" + registers[i] + "</td>";
      tablecontents += "<td>" + registers[i].toString(16).toUpperCase() + "</td>";
      tablecontents += "<td>" + createBinaryString(registers[i]) + "</td>";
      tablecontents += "</tr>";
   }
   tablecontents += "</table>";
   document.getElementById("registerTable").innerHTML = tablecontents;
}
function drawArrayMemory(memory)
{

  var tablecontents = "";
  var binaryString = "";
  var counter =0;
  var one ="";
  var two ="";
  var three ="";
  var four ="";
  var temp=0;

    tablecontents = "<table class = tableBorder>";
    tablecontents += "<tr class = steps>";
    tablecontents += "<td>" + "Memory" + "</td>";
    tablecontents += "</tr>";

    for (var i = 0; i < memory.length; i ++)
   {
      binaryString = createBinaryString(memory[i]);
      one =binaryString.substring(0,8);
      two =binaryString.substring(8,16);
      three=binaryString.substring(16,24);
      four =binaryString.substring(24);
      tempOne= parseInt(one, 2);
      tempTwo =parseInt(two, 2);
      tempThree=parseInt(three, 2);
      tempFour =parseInt(four, 2);
      tablecontents += "<tr>";
      tablecontents += "<td>" + counter + "</td>";
      counter++;
      tablecontents += "<td>" + i + "</td>";
      tablecontents += "<td>" + tempOne + "</td>";
      tablecontents += "<td>" + tempOne.toString(16).toUpperCase() + "</td>";
      tablecontents += "<td>" + one + "</td>";
      tablecontents += "</tr>";
      tablecontents += "<tr>";
      tablecontents += "<td>" + counter + "</td>";
      counter++;
      tablecontents += "<td>"+ "</td>";
      tablecontents += "<td>" + tempTwo+ "              " + "</td>";
      tablecontents += "<td>" + tempTwo.toString(16).toUpperCase() + "</td>";
      tablecontents += "<td>" + two + "</td>";
      tablecontents += "</tr>";
      tablecontents += "<tr>";
      tablecontents += "<td>" + counter + "</td>";
      counter++;
      tablecontents += "<td>"+ "</td>";
      tablecontents += "<td>" + tempThree + "</td>";
      tablecontents += "<td>" + tempThree.toString(16).toUpperCase() + "</td>";
      tablecontents += "<td>" + three + "</td>";
      tablecontents += "</tr>";
      tablecontents += "<tr>";
      tablecontents += "<td>" + counter + "</td>";
      counter++;
      tablecontents += "<td>"+ "</td>";
      tablecontents += "<td>" + tempFour + "</td>";
      tablecontents += "<td>" + tempFour.toString(16).toUpperCase() + "</td>";
      tablecontents += "<td>" + four + "</td>";
      tablecontents += "</tr>";
   }
   tablecontents += "</table>";
   document.getElementById("memoryTable").innerHTML = tablecontents;
}

function getFormat(index, line){  
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
    rs=translateRegister(line[index+1]);
    rt=translateRegister(line[index+2]);;
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
    rs=translateRegister(line[index+1]);
    rt=translateRegister(line[index+3]);;
    address=createBinaryString2(line[index+2]);
    format = op+rs+rt+(address/4);
  }
  else if (line[index]=="lh")
  {
    op = "100001";
    rs=translateRegister(line[index+1]);
    rt=translateRegister(line[index+3]);;
    address=createBinaryString2(line[index+2]);
    format = op+rs+rt+(address/2);
  }
  else if (line[index]=="lhu")
  {
    op = "100101";
    rs=translateRegister(line[index+1]);
    rt=translateRegister(line[index+3]);;
    address=createBinaryString2(line[index+2]);
    format = op+rs+rt+address;
  }
  else if (line[index]=="lb")
  {
    op = "100000";
    rs=translateRegister(line[index+1]);
    rt=translateRegister(line[index+3]);;
    address=createBinaryString2(line[index+2]);
    format = op+rs+rt+address;
  }
  else if (line[index]=="lbu")
  {
    op = "100100";
    rs=translateRegister(line[index+1]);
    rt=translateRegister(line[index+3]);;
    address=createBinaryString2(line[index+2]);
    format = op+rs+rt+address;
  }
  else if (line[index]=="sw")
  {
    op = "101011";
    rs=translateRegister(line[index+1]);
    rt=translateRegister(line[index+3]);;
    address=createBinaryString2(line[index+2]);
    format = op+rs+rt+(address/4);
  }
  else if (line[index]=="sh")
  {
    op = "101001";
    rs=translateRegister(line[index+1]);
    rt=translateRegister(line[index+3]);;
    address=createBinaryString2(line[index+2]);
    format = op+rs+rt+address;
  }
  else if (line[index]=="sb")
  {
    op = "101000";
    rs=translateRegister(line[index+1]);
    rt=translateRegister(line[index+3]);;
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
    shamt = createBinaryString(line[index+3]);
    funct = "000000";
    format = op+rs+rt+rd+shamt+funct;
  }
  else if (line[index]=="srl")
  {
    op = "000000";
    rs=translateRegister(line[index+2]);
    rt="00000";
    rd=translateRegister(line[index+1]);
    shamt = createBinaryString(line[index+3]);
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
    rs=translateRegister(line[index+1]);
    rt=translateRegister(line[index+2]);;
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
    rs=translateRegister(line[index+1]);
    rt=translateRegister(line[index+2]);;
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
  return format;
}
