Mips-js-Simulator
=================

Mips Simulator Using Js

Paste the following example in the code area to get the final Registers table, Memory table and Instructions trace table.

Example Code:
  <pre><code>
  addi $a0 $a0 85
  addi $a1 $a1 5
  gcd : beq $a0 $a1 exit
  slt $t0 $a1 $a0
  bne $t0 $zero loop
  sub $a1 $a1 $a0
  j gcd
  loop : sub $a0 $a0 $a1
  j gcd
  exit : add $v0 $a0 $zero
  </code></pre>
